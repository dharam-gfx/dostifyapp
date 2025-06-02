import { createMessageTimestamp, formatMessageTime } from "@/utils/dateUtils";
import { encryptMessage, decryptMessage } from "@/utils/encryptionUtils";
import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
    ChatMessage,
    UserJoinLeaveData,
    TypingEventData,
    MessageEventData,
    SocketHookReturn,
    LoadOldMessagesData
} from "@/types/socket";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000";

// Create system message
const createSystemMessage = (
    sender: string,
    message: string,
    isSent: boolean
): ChatMessage => ( {
    type: "system",
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent
} );

// Create user message
const createUserMessage = (
    sender: string,
    message: string,
    isSent: boolean,
    messageId?: string,
    replyTo?: { message: string; sender?: string; messageId?: string }
): ChatMessage => ( {
    type: "user",
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent,
    messageId: messageId || `msg_${Date.now()}_${Math.random().toString( 36 ).substr( 2, 9 )}`,
    replyTo
} );

export function useSocket( roomId: string, userName: string = "" ): SocketHookReturn {
    const [socket, setSocket] = useState<Socket | null>( null );
    const [userId, setUserId] = useState( "" );
    const [usersTyping, setUsersTyping] = useState<string[]>( [] );
    const [userEvents, setUserEvents] = useState<{ joined?: string; left?: string }>( {} );
    const [users, setUsers] = useState<string[]>( [] );
    const [isConnected, setIsConnected] = useState( false );
    const [messages, setMessages] = useState<ChatMessage[]>( [] );
    const userIdRef = useRef( "" );
    const recentlyLeftUsers = useRef<Record<string, number>>( {} );

    useEffect( () => {
        const socketIo = io( SERVER_URL, {
            transports: ["websocket", "polling"],
            upgrade: true,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 10,     // More attempts
            reconnectionDelay: 1000,
            timeout: 10000,               // Increase timeout
            autoConnect: true             // Ensure auto-connect is on
        } );

        socketIo.on( "connect_error", ( err ) => {
            console.error( "Socket connect_error:", err.message );
        } );

        socketIo.on( "connect_timeout", () => {
            console.warn( "Socket connection timeout" );
        } );

        const cleanupInterval = setInterval( () => {
            const now = Date.now();
            const threshold = 60000;
            Object.keys( recentlyLeftUsers.current ).forEach( ( id ) => {
                if ( now - recentlyLeftUsers.current[id] > threshold ) {
                    delete recentlyLeftUsers.current[id];
                }
            } );
        }, 60000 );

        socketIo.emit( "join-room", { roomId, userName } );
        socketIo.on( "joined-room", ( { userId, users }: UserJoinLeaveData ) => {
            console.log( "Joined room event received:", userId, "users:", users?.length || 0 );
            userIdRef.current = userId;
            setUserId( userId );
            setIsConnected( true );
            setUsers( users || [] );

            // Check if we already have a "you joined" message to avoid duplicates
            setMessages( ( prev ) => {
                const alreadyHasJoinedMessage = prev.some(
                    msg => msg.type === "system" &&
                        msg.message === `you joined the chat` &&
                        msg.timestamp.startsWith( new Date().toISOString().split( 'T' )[0] )
                );

                if ( alreadyHasJoinedMessage ) {
                    console.log( "Skipping duplicate 'joined' message" );
                    return prev;
                }

                console.log( "Adding 'you joined' message" );
                return [
                    ...prev,
                    createSystemMessage( userName, `you joined the chat`, true )
                ];
            } );
        } ); socketIo.on( "connect", () => {
            console.log( "Socket connected" );
            setIsConnected( true );
        } );

        socketIo.on( "disconnect", () => {
            console.log( "Socket disconnected" );
            setIsConnected( false );
        } ); 
        socketIo.on( "reconnect", ( attemptNumber ) => {
            console.log( `Socket reconnected after ${attemptNumber} attempts` );

            // Re-join the room after reconnection
            socketIo.emit( "join-room", { roomId, userName } );

            // Wait for join confirmation before requesting old messages
            socketIo.once( "joined-room", () => {
                console.log( "Joined room confirmed after reconnect. Requesting old messages..." );
                socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
                console.log( "Client: requested old messages after reconnection" );
            } );
        } );

        socketIo.on( "user-joined", ( { userId: joinedUser, users }: UserJoinLeaveData ) => {
            setUserEvents( ( e ) => ( { ...e, joined: joinedUser } ) );
            setUsers( users || [] );
            setMessages( ( prev ) => [
                ...prev,
                createSystemMessage( joinedUser, `${joinedUser} joined the chat`, false )
            ] );
        } );

        socketIo.on( "user-left", ( { userId: leftUser, users }: UserJoinLeaveData ) => {
            setUserEvents( ( e ) => ( { ...e, left: leftUser } ) );
            setUsers( users || [] );

            const now = Date.now();
            if ( recentlyLeftUsers.current[leftUser] && now - recentlyLeftUsers.current[leftUser] < 5000 ) {
                return;
            }
            recentlyLeftUsers.current[leftUser] = now;

            setMessages( ( prev ) => {
                const alreadyLeft = prev.some(
                    ( msg ) =>
                        msg.type === "system" &&
                        msg.sender === leftUser &&
                        msg.message === `${leftUser} left the chat`
                );
                if ( alreadyLeft ) return prev;
                return [
                    ...prev,
                    createSystemMessage( leftUser, `${leftUser} left the chat`, leftUser === userIdRef.current )
                ];
            } );
        } );

        socketIo.on( "users-typing", ( { userIds }: TypingEventData ) => {
            setUsersTyping( userIds.filter( ( id ) => id !== socketIo.id ) );
        } );

        socketIo.on( "receive-message", ( { encryptedData, userId, messageId, replyTo }: MessageEventData ) => {
            const decryptedMessage = decryptMessage( encryptedData );
            const decryptedReplyTo = replyTo
                ? {
                    ...replyTo,
                    message: decryptMessage( replyTo.message )
                }
                : undefined;

            setMessages( ( prev ) => [
                ...prev,
                createUserMessage( userId, decryptedMessage, false, messageId, decryptedReplyTo )
            ] );
        } );
        // 🔥 Load old messages from server and decrypt
        socketIo.on( "load-old-messages", ( { messages }: LoadOldMessagesData ) => {
            console.log( `Received load-old-messages event with ${messages?.length || 0} messages`,messages );

            // Safety check for messages
            if ( !messages || !Array.isArray( messages ) ) {
                console.error( "Invalid messages in load-old-messages event" );
                return;
            }

            if ( messages.length === 0 ) {
                console.log( "No old messages to load" );
                return;
            }

            // Extract username base from current user ID to match with previous messages
            const userNameBase = userName.trim();

            // Convert server message format to client format
            const decrypted = messages.map( ( msg ) => {
                // Get the base username part (before the underscore and nanoid)
                const msgUserName = msg.userId.split( '_' )[0];

                // Check if this message was sent by current user in a previous session
                // by comparing the base username part
                const wasCurrentUser = userNameBase && msgUserName === userNameBase;

                return {
                    type: "user" as const,
                    sender: msg.userId,
                    message: decryptMessage( msg.encryptedData ),
                    timestamp: msg.timestamp ? formatMessageTime( new Date( msg.timestamp ) ) : createMessageTimestamp(),
                    // Mark as sent by current user if username matches
                    isSent: wasCurrentUser || msg.userId === userIdRef.current,
                    messageId: msg.messageId,
                    replyTo: msg.replyTo
                        ? {
                            messageId: msg.replyTo.messageId,
                            sender: msg.replyTo.sender,
                            message: decryptMessage( msg.replyTo.message )
                        }
                        : undefined
                };
            } );            // Merge old messages with current messages, avoiding duplicates based on messageId
            setMessages( ( prev ) => {
                // Get all existing message IDs for deduplication
                const existingMessageIds = new Set(
                    prev.map( msg => msg.messageId ).filter( Boolean )
                );

                console.log( "Existing message count:", prev.length );
                console.log( "Received message count:", decrypted.length );

                // Filter out messages we already have
                const newMessages = decrypted.filter(
                    msg => !msg.messageId || !existingMessageIds.has( msg.messageId )
                );

                console.log( "New unique messages to add:", newMessages.length );

                // Only add new messages
                if ( newMessages.length > 0 ) {
                    console.log( "Adding new messages to chat" );
                    return [...newMessages, ...prev];
                }
                console.log( "No new messages to add" );
                return prev;
            } );
        } );

        setSocket( socketIo );
        const handleVisibilityChange = () => {
            if ( document.visibilityState === "visible" ) {
                if ( socketIo && !socketIo.connected ) {
                    console.log( "Tab visible but socket disconnected. Reconnecting..." );
                    socketIo.connect();

                    // Use once to ensure this only happens on the next connection
                    socketIo.once( "connect", () => {
                        console.log( "Socket reconnected. Joining room..." );
                        socketIo.emit( "join-room", { roomId, userName } );

                        // Wait for join confirmation before requesting old messages
                        socketIo.once( "joined-room", () => {
                            console.log( "Joined room confirmed. Now requesting old messages..." );
                            socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
                            console.log( "Client: requested old messages" );
                        } );
                    } );
                } else if ( socketIo && socketIo.connected ) {
                    // Already connected, just request old messages
                    console.log( "Tab visible with socket already connected. Requesting old messages" );
                    console.log( "Current state - roomId:", roomId, "userId:", userIdRef.current, "connected:", socketIo.connected );
                    socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
                    console.log( "Client: requested old messages" );
                }
            }
        };

        document.addEventListener( "visibilitychange", handleVisibilityChange );

        return () => {
            if ( socketIo.connected ) {
                socketIo.emit( "leave-room", { roomId, userName } );
            }
            socketIo.disconnect();
            clearInterval( cleanupInterval );
            document.removeEventListener( "visibilitychange", handleVisibilityChange );
        };
    }, [roomId, userName] );

    const sendMessage = useCallback(
        (
            message: string,
            userId: string,
            replyTo?: { message: string; sender?: string; messageId?: string }
        ) => {
            if ( socket ) {
                const messageId = `msg_${Date.now()}_${Math.random().toString( 36 ).substr( 2, 9 )}`;
                const encryptedData = encryptMessage( message );
                const encryptedReplyTo = replyTo
                    ? { ...replyTo, message: encryptMessage( replyTo.message ) }
                    : undefined;

                socket.emit( "send-message", {
                    encryptedData,
                    userId,
                    messageId,
                    replyTo: encryptedReplyTo
                } );

                setMessages( ( prev ) => [
                    ...prev,
                    createUserMessage( userId, message, true, messageId, replyTo )
                ] );
            }
        },
        [socket]
    );

    const sendTyping = useCallback(
        ( isTyping: boolean ) => {
            if ( socket && userIdRef.current ) {
                socket.emit( "user-typing", { userId: userIdRef.current, isTyping } );
            }
        },
        [socket]
    );

    return {
        socket,
        userId,
        sendMessage,
        sendTyping,
        usersTyping,
        userEvents,
        users,
        isConnected,
        messages,
        setMessages
    };
}
