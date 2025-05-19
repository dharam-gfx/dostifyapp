// hooks/useSocket.ts
import { createMessageTimestamp } from "@/utils/dateUtils";
import { useEffect, useState, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
    ChatMessage,
    UserJoinLeaveData,
    TypingEventData,
    MessageEventData,
    SocketHookReturn
} from "@/types/socket";

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:5000"; // Use env variable for server URL

// Helper function to create system messages
const createSystemMessage = ( sender: string, message: string, isSent: boolean ): ChatMessage => ( {
    type: 'system',
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent
} );

// Helper function to create user messages
const createUserMessage = ( sender: string, message: string, isSent: boolean ): ChatMessage => ( {
    type: 'user',
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent
} );

export function useSocket( roomId: string, userName: string = "" ): SocketHookReturn {
    const [socket, setSocket] = useState<Socket | null>( null );
    const [userId, setUserId] = useState( "" );
    const [usersTyping, setUsersTyping] = useState<string[]>( [] );
    const [userEvents, setUserEvents] = useState<{ joined?: string, left?: string }>( {} );
    const [users, setUsers] = useState<string[]>( [] );
    const [isConnected, setIsConnected] = useState( false );
    const [messages, setMessages] = useState<ChatMessage[]>( [] ); // Chat messages array
    const userIdRef = useRef( "" );
    // Track recently left users to prevent duplicate messages
    const recentlyLeftUsers = useRef<Record<string, number>>( {} );

    useEffect( () => {
        const socketIo = io( SERVER_URL, {
            transports: ["websocket"], // Ensures a clean WebSocket connection
        } );

        // Clean up stale entries from recentlyLeftUsers every minute
        const cleanupInterval = setInterval( () => {
            const now = Date.now();
            const staleThreshold = 60000; // 1 minute

            Object.keys( recentlyLeftUsers.current ).forEach( userId => {
                if ( now - recentlyLeftUsers.current[userId] > staleThreshold ) {
                    delete recentlyLeftUsers.current[userId];
                }
            } );
        }, 60000 );

        socketIo.emit( "join-room", { roomId, userName } );

        socketIo.on( "joined-room", ( { userId, users }: UserJoinLeaveData ) => {
            userIdRef.current = userId;
            setUserId( userId );
            setIsConnected( true );
            setUsers( users || [] );
            // Add system message for self join
            setMessages( prev => ( [
                ...prev,
                createSystemMessage( userName, `you joined the chat`, true )
            ] ) );
        } );

        socketIo.on( "connect", () => setIsConnected( true ) );
        socketIo.on( "disconnect", () => setIsConnected( false ) );

        socketIo.on( "user-joined", ( { userId: joinedUser, users }: UserJoinLeaveData ) => {
            setUserEvents( e => ( { ...e, joined: joinedUser } ) );
            setUsers( users || [] );
            // Add system message for other user join
            setMessages( prev => ( [
                ...prev,
                createSystemMessage( joinedUser, `${joinedUser} joined the chat`, false )
            ] ) );
        } );

        socketIo.on( "user-left", ( { userId: leftUser, users }: UserJoinLeaveData ) => {
            setUserEvents( e => ( { ...e, left: leftUser } ) );
            setUsers( users || [] );

            // Check if this user has recently left to prevent duplicate messages
            const now = Date.now();
            if ( recentlyLeftUsers.current[leftUser] && now - recentlyLeftUsers.current[leftUser] < 5000 ) {
                console.log( "Preventing duplicate left message for", leftUser );
                return; // Skip adding another message if user left recently (within 5 seconds)
            }

            // Mark this user as recently left
            recentlyLeftUsers.current[leftUser] = now;

            // Add system message for user leave (with double-check on existing messages)
            setMessages( prev => {
                // Still do an additional check on existing messages as a fallback
                const alreadyLeft = prev.some(
                    msg =>
                        msg.type === 'system' &&
                        msg.sender === leftUser &&
                        msg.message === `${leftUser} left the chat`
                );
                if ( alreadyLeft ) {
                    return prev; // Don't add duplicate
                }
                return [
                    ...prev,
                    createSystemMessage( leftUser, `${leftUser} left the chat`, leftUser === userIdRef.current )
                ];
            } );
            console.log( "User left:", leftUser, "sss", userIdRef.current );
        } );

        socketIo.on( "users-typing", ( { userIds }: TypingEventData ) => {
            // Only show other users as typing, not yourself
            setUsersTyping( userIds.filter( ( id: string ) => id !== socketIo.id ) );
        } ); socketIo.on( "receive-message", ( { encryptedData, userId }: MessageEventData ) => {
            console.log( "Message received:", encryptedData, userId );

            // Add received message to messages array
            setMessages( prev => ( [
                ...prev,
                createUserMessage( userId, encryptedData, false )
            ] ) );
        } );

        setSocket( socketIo );

        return () => {
            if ( socketIo.connected ) {
                socketIo.emit( "leave-room", { roomId, userName } );
            }
            socketIo.disconnect();
            clearInterval( cleanupInterval );
        };
    }, [roomId, userName] );

    const sendMessage = useCallback( ( encryptedData: string, userId: string ) => {
        if ( socket ) {
            console.log( "Sending message:", encryptedData, userId );
            socket.emit( "send-message", { encryptedData, userId } );
            // Add sent message to messages array
            setMessages( prev => ( [
                ...prev,
                createUserMessage( userId, encryptedData, true )
            ] ) );
            console.log( "Message sent:", messages );
        }
    }, [socket, messages] );

    const sendTyping = useCallback( ( isTyping: boolean ) => {
        if ( socket && userIdRef.current ) {
            socket.emit( "user-typing", { userId: userIdRef.current, isTyping } );
        }
    }, [socket] );

    return { socket, userId, sendMessage, sendTyping, usersTyping, userEvents, users, isConnected, messages, setMessages };
}
