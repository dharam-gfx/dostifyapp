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
        } ); socketIo.on( "reconnect", ( attemptNumber ) => {
            console.log( `Socket reconnected after ${attemptNumber} attempts` );
            socketIo.emit( "join-room", { roomId, userName } );

            // Request messages after rejoining room
            socketIo.once( "joined-room", () => {
                socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
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
        } ); socketIo.on( "receive-message", ( { encryptedData, userId, messageId, replyTo }: MessageEventData ) => {
            setMessages( prev => [
                ...prev,
                createUserMessage(
                    userId,
                    decryptMessage( encryptedData ),
                    false,
                    messageId,
                    replyTo && { ...replyTo, message: decryptMessage( replyTo.message ) }
                )
            ] );
        } );
        // 🔥 Load old messages from server and decrypt
        socketIo.on( "load-old-messages", ( { messages }: LoadOldMessagesData ) => {
            console.log( `Received ${messages?.length || 0} old messages` );

            // Return early for invalid/empty messages
            if ( !messages?.length || !Array.isArray( messages ) ) return;

            // Convert server messages to client format
            const userNameBase = userName.trim();
            const decrypted = messages.map( msg => ( {
                type: "user" as const,
                sender: msg.userId,
                message: decryptMessage( msg.encryptedData ),
                timestamp: msg.timestamp ? formatMessageTime( new Date( msg.timestamp ) ) : createMessageTimestamp(),
                rawTimestamp: msg.timestamp,
                isSent: ( userNameBase && msg.userId.split( '_' )[0] === userNameBase ) || msg.userId === userIdRef.current,
                messageId: msg.messageId,
                replyTo: msg.replyTo && {
                    messageId: msg.replyTo.messageId,
                    sender: msg.replyTo.sender,
                    message: decryptMessage( msg.replyTo.message )
                }
            } ) );

            // Process messages
            setMessages( prev => {
                // No existing messages, use all received ones
                if ( prev.length === 0 ) return [...decrypted];

                // Keep system messages about joining today
                const systemMsgs = prev.filter( msg =>
                    msg.type === "system" &&
                    msg.message === `you joined the chat` &&
                    msg.timestamp.startsWith( new Date().toISOString().split( 'T' )[0] )
                );

                // Check if server has newer/more messages
                const userMsgsCount = prev.filter( m => m.type === "user" ).length;
                const serverHasNewerData = decrypted.length > 0 && (
                    userMsgsCount === 0 ||
                    decrypted.length > userMsgsCount ||
                    Math.max( ...decrypted.map( m => new Date( m.timestamp ).getTime() ), 0 ) >
                    Math.max( ...prev.filter( m => m.type === "user" ).map( m => new Date( m.timestamp ).getTime() ), 0 )
                );

                // Replace messages or add new unique ones
                if ( serverHasNewerData ) {
                    return [...decrypted, ...systemMsgs];
                }

                // Add only messages we don't already have
                const existingIds = new Set( prev.map( m => m.messageId ).filter( Boolean ) );
                const newMsgs = decrypted.filter( m => !m.messageId || !existingIds.has( m.messageId ) );
                return newMsgs.length > 0 ? [...newMsgs, ...prev] : prev;
            } );
        } ); setSocket( socketIo );

        // Handle visibility change to reconnect or fetch messages when tab becomes visible
        const handleVisibilityChange = () => {
            if ( document.visibilityState !== "visible" || !socketIo ) return;

            if ( !socketIo.connected ) {
                console.log( "Tab visible but socket disconnected. Reconnecting..." );
                socketIo.connect();
                socketIo.once( "connect", () => {
                    console.log( "Socket reconnected. Joining room..." );
                    socketIo.emit( "join-room", { roomId, userName } );
                    socketIo.once( "joined-room", () => {
                        console.log( "Joined room confirmed. Requesting old messages..." );
                        socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
                    } );
                } );
            } else {
                // Already connected, just request old messages
                console.log( "Tab visible with socket already connected. Requesting messages..." );
                socketIo.emit( "request-old-messages", { roomId, userId: userIdRef.current } );
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
    }, [roomId, userName] ); const sendMessage = useCallback( ( message: string, userId: string, replyTo?: { message: string; sender?: string; messageId?: string } ) => {
        if ( !socket ) return;

        const messageId = `msg_${Date.now()}_${Math.random().toString( 36 ).substr( 2, 9 )}`;

        // Send message to server
        socket.emit( "send-message", {
            encryptedData: encryptMessage( message ),
            userId,
            messageId,
            replyTo: replyTo && { ...replyTo, message: encryptMessage( replyTo.message ) }
        } );

        // Add to local messages
        setMessages( prev => [...prev, createUserMessage( userId, message, true, messageId, replyTo )] );
    }, [socket] );

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
