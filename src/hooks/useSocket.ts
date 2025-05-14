// src/hooks/useSocket.ts
import { createMessageTimestamp } from '@/utils/dateUtils';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketOptions {
    autoConnect?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
}

interface ChatMessage {
    type: string;
    sender?: string;
    message: string;
    timestamp: string;
    isSent?: boolean;
}

export default function useSocket(roomId: string | null, options: UseSocketOptions = {}) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    const defaultOptions = {
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        ...options
    };

    useEffect(() => {
        if (!roomId) {
            setConnectionError('Room ID is required to connect');
            return;
        }

        const initSocket = async () => {
            try {
                console.log(`[Socket] Initializing connection for room ${roomId}...`);

                const response = await fetch('/api/socket');
                const data = await response.json();
                console.log('[Socket] Server status:', data);

                const socketURL = `http://${window.location.hostname}:3002`;
                console.log(`[Socket] Connecting to ${socketURL}`);

                const socketInstance = io(socketURL, {
                    reconnectionAttempts: defaultOptions.reconnectionAttempts,
                    reconnectionDelay: defaultOptions.reconnectionDelay,
                    timeout: defaultOptions.timeout,
                    transports: ['websocket', 'polling'],
                    autoConnect: defaultOptions.autoConnect,
                    reconnection: true,
                });

                socketRef.current = socketInstance;

                socketInstance.on('connect', () => {
                    console.log(`[Socket] Connected with ID: ${socketInstance.id}`);
                    setIsConnected(true);
                    setConnectionError(null);

                    console.log(`[Socket] Joining room: ${roomId}`);
                    socketInstance.emit('joinRoom', roomId);
                });

                socketInstance.on('connect_error', (err) => {
                    console.error('[Socket] Connection error:', err);
                    setConnectionError(`Connection error: ${err.message}`);
                    setIsConnected(false);
                });

                socketInstance.on('chatMessage', ({ type, sender, message, timestamp }) => {
                    console.log('[Socket] Received message:', { type, sender, message, timestamp });
                    setMessages((prev) => [
                        ...prev,
                        { type, sender :"user", message, timestamp: createMessageTimestamp(), isSent: false }
                    ]);
                });

                socketInstance.on('disconnect', (reason) => {
                    console.log('[Socket] Disconnected:', reason);
                    setIsConnected(false);
                });
            } catch (error) {
                console.error("[Socket] Initialization error:", error);
                setConnectionError(`Socket error: ${(error as Error).message}`);
            }
        };

        initSocket();

        return () => {
            console.log('[Socket] Cleaning up connection');
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
        };
    }, [roomId]);

    const sendMessage = (message: string) => {
        if (!message.trim() || !socketRef.current || !isConnected || !roomId) {
            console.log('[Socket] Cannot send message:', {
                hasMessage: Boolean(message.trim()),
                hasSocket: Boolean(socketRef.current),
                isConnected,
                hasRoomId: Boolean(roomId)
            });
            return false;
        }

        try {
            const timestamp = createMessageTimestamp();
            console.log(`[Socket] Sending message to room ${roomId}:`, message);

            const newMessage: ChatMessage = {
                type: 'text',
                sender: 'you',
                message,
                timestamp,
                isSent: true
            };
            setMessages((prev) => [...prev, newMessage]);

            socketRef.current.emit('chatMessage', { roomId, message, timestamp });
            return true;
        } catch (error) {
            console.error('[Socket] Error sending message:', error);
            setConnectionError(`Error sending: ${(error as Error).message}`);
            return false;
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        connectionError,
        messages,
        sendMessage,
        setMessages
    };
}