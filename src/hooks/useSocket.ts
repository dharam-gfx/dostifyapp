// hooks/useSocket.ts
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = "http://localhost:5000"; // Your server's URL

export function useSocket( roomId: string , userName: string = "" ) {
    const [socket, setSocket] = useState<Socket | null>( null );
    const [userId, setUserId] = useState( "" );

    useEffect( () => {
        const socketIo = io( SERVER_URL, {
            transports: ["websocket"], // Ensures a clean WebSocket connection
        } );
        socketIo.emit( "join-room", { roomId, userName } );

        socketIo.on( "joined-room", ( { userId } ) => {
            console.log( "You joined as:", userId );
            setUserId( userId );
        } );

        socketIo.on( "receive-message", ( { encryptedData } ) => {

            console.log( "Message received:", encryptedData );
        } );

        setSocket( socketIo );

        return () => {
            socketIo.emit( "leave-room", { roomId , userName} );
            console.log( "Disconnected from room:", roomId );
            socketIo.disconnect();
        };
    }, [roomId] );

    const sendMessage = ( encryptedData: string ) => {
        if ( socket ) {
            console.log( "Sending message:", encryptedData );
            socket.emit( "send-message", { encryptedData } );
        }
    };

    return { socket, userId, sendMessage };
}
