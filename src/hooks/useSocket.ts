import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { createMessageTimestamp } from '@/utils/dateUtils';

interface UseSocketOptions {
    autoConnect?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
}

interface ChatMessage {
    type: 'system' | 'text';
    sender?: string;
    message: string;
    timestamp: string;
    isSent?: boolean;
}

// Generate or get a unique user id for this browser
function getOrCreateUserId() {
    let userId = localStorage.getItem('dostify_user_id');
    if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('dostify_user_id', userId);
    }
    return userId;
}

export default function useSocket(
    roomId: string | null,
    options: UseSocketOptions = {}
) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [connectionError, setConnectionError] = useState<string | null>(null);
    const [userCount, setUserCount] = useState<number>(0);

    const defaultOptions = {
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        ...options,
    };

    useEffect(() => {
        if (!roomId) {
            setConnectionError('Room ID is required to connect');
            return;
        }

        const userId = getOrCreateUserId();

        const initSocket = async () => {
            try {
                await fetch('/api/socket');
                const socketURL = `http://${window.location.hostname}:3003`;

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
                    setIsConnected(true);
                    setConnectionError(null);
                    // Send userId when joining room
                    socketInstance.emit('joinRoom', { roomId, userId });
                });

                socketInstance.on('chatMessage', ({ type, sender, message, timestamp }) => {
                    // Ignore messages sent by myself
                    if (sender && sender === socketRef.current?.id) return;
                    // Prevent duplicate messages (by sender+timestamp+message)
                    setMessages((prev) => {
                        if (prev.some(m => m.sender === sender && m.timestamp === timestamp && m.message === message)) {
                            return prev;
                        }
                        return [
                            ...prev,
                            {
                                type: type || 'text',
                                sender: sender ?? 'user',
                                message,
                                timestamp: timestamp ?? createMessageTimestamp(),
                                isSent: false,
                            },
                        ];
                    });
                });

                socketInstance.on('userCount', (count: number) => {
                    console.log(`User count event received: ${count}`);
                    setUserCount(count);
                    console.log(`User count state updated: ${count}`);
                });

                socketInstance.on('connect_error', (err) => {
                    setConnectionError(`Connection error: ${err.message}`);
                    setIsConnected(false);
                });

                socketInstance.on('disconnect', () => {
                    setIsConnected(false);
                });
            } catch (error) {
                setConnectionError(`Socket error: ${(error as Error).message}`);
            }
        };

        initSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setIsConnected(false);
        };
    }, [roomId, defaultOptions.autoConnect, defaultOptions.reconnectionAttempts, defaultOptions.reconnectionDelay, defaultOptions.timeout]);

    const sendMessage = (message: string) => {
        if (!message.trim() || !socketRef.current || !isConnected || !roomId) {
            return false;
        }
        try {
            const timestamp = createMessageTimestamp();
            const newMessage: ChatMessage = {
                type: 'text',
                sender: 'you',
                message,
                timestamp,
                isSent: true,
            };
            setMessages((prev) => [...prev, newMessage]);
            socketRef.current.emit('chatMessage', { roomId, message, timestamp });
            return true;
        } catch (error) {
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
        setMessages,
        userCount,
    };
}
