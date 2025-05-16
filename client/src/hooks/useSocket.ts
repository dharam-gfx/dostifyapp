// hooks/useSocket.ts
import { createMessageTimestamp } from "@/utils/dateUtils";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Your server's URL

// Define ChatMessage type
export type ChatMessage = {
    type: string;
    sender?: string;
    message: string;
    timestamp: string;
    isSent?: boolean;
};

export function useSocket( roomId: string , userName: string = "" ) {
    const [socket, setSocket] = useState<Socket | null>( null );
    const [userId, setUserId] = useState( "" );
    const [usersTyping, setUsersTyping] = useState<string[]>([]);
    const [userEvents, setUserEvents] = useState<{ joined?: string, left?: string }>({});
    const [users, setUsers] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]); // Chat messages array

    useEffect( () => {
        const socketIo = io( SERVER_URL, {
            transports: ["websocket"], // Ensures a clean WebSocket connection
        } );

        socketIo.emit( "join-room", { roomId, userName } );

        socketIo.on( "joined-room", ( { userId, users } ) => {
            console.log( "User joined:", userId, users );
            setUserId( userId );
            setIsConnected(true);
            setUsers(users || []);
            // Add system message for self join
            setMessages(prev => ([
                ...prev,
                {
                    type: 'system',
                    sender: userName,
                    message: `you joined the chat`,
                    timestamp: createMessageTimestamp(),
                    isSent: true
                }
            ]));
        } );

        socketIo.on( "connect", () => setIsConnected(true) );
        socketIo.on( "disconnect", () => setIsConnected(false) );

        socketIo.on( "user-joined", ( { userId: joinedUser, users } ) => {
            setUserEvents(e => ({ ...e, joined: joinedUser }));
            setUsers(users || []);
            // Add system message for other user join
            setMessages(prev => ([
                ...prev,
                {
                    type: 'system',
                    sender: joinedUser,
                    message: `${joinedUser} joined the chat`,
                    timestamp: createMessageTimestamp(),
                    isSent: false
                }
            ]));
        });

        socketIo.on( "user-left", ( { userId: leftUser, users } ) => {
            setUserEvents(e => ({ ...e, left: leftUser }));
            setUsers(users || []);
            // Add system message for user leave
            setMessages(prev => ([
                ...prev,
                {
                    type: 'system',
                    sender: leftUser,
                    message: `${leftUser} left the chat`,
                    timestamp: createMessageTimestamp(),
                    isSent: leftUser === userId
                }
            ]));
            console.log( "User left:", leftUser, "sss",userId );
        });

        socketIo.on( "users-typing", ( { userIds } ) => {
            // Only show other users as typing, not yourself
            setUsersTyping(userIds.filter((id: string) => id !== socketIo.id));
        });

        socketIo.on( "receive-message", ( { encryptedData, userId } ) => {
            console.log( "Message received:", encryptedData , userId);
            // Add received message to messages array
            setMessages(prev => ([
                ...prev,
                {
                    type: 'user',
                    sender: userId,
                    message: encryptedData,
                    timestamp: createMessageTimestamp(),
                    isSent: false
                }
            ]));
            console.log( "Message recv:", messages );
        } );

        setSocket( socketIo );

        return () => {
            if (socketIo.connected) {
                socketIo.emit( "leave-room", { roomId , userName} );
            }
            socketIo.disconnect();
        };
    }, [roomId, userName] );

    const sendMessage = ( encryptedData: string, userId:string ) => {
        if ( socket ) {
            console.log( "Sending message:", encryptedData, userId );
            socket.emit( "send-message", { encryptedData , userId} );
            // Add sent message to messages array
            setMessages(prev => ([
                ...prev,
                {
                    type: 'user',
                    sender: userId,
                    message: encryptedData,
                    timestamp: createMessageTimestamp(),
                    isSent: true
                }
            ]));
            console.log( "Message sent:", messages );
        }
    };

    const sendTyping = (isTyping: boolean) => {
        if (socket && userId) {
            socket.emit("user-typing", { userId, isTyping });
        }
    };

    return { socket, userId, sendMessage, sendTyping, usersTyping, userEvents, users, isConnected, messages, setMessages };
}
