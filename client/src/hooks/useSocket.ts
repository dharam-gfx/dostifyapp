// Custom React hook for managing a Socket.IO chat connection.
// Handles joining/leaving rooms, sending/receiving messages, user typing events, and user presence.
// Returns all relevant state and actions for use in chat components.
//
// Usage: const { socket, userId, sendMessage, ... } = useSocket(roomId, userName);

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

// Helper function to create a system message (e.g., join/leave notifications)
const createSystemMessage = (sender: string, message: string, isSent: boolean): ChatMessage => ({
    type: 'system',
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent
});

// Helper function to create a user message (actual chat content)
const createUserMessage = (
    sender: string,
    message: string,
    isSent: boolean,
    messageId?: string,
    replyTo?: { message: string; sender?: string; messageId?: string; }
): ChatMessage => ({
    type: 'user',
    sender,
    message,
    timestamp: createMessageTimestamp(),
    isSent,
    messageId: messageId || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    replyTo
});

export function useSocket(roomId: string, userName: string = ""): SocketHookReturn {
    // Socket.IO client instance
    const [socket, setSocket] = useState<Socket | null>(null);
    // The current user's unique ID assigned by the server
    const [userId, setUserId] = useState("");
    // List of user IDs currently typing
    const [usersTyping, setUsersTyping] = useState<string[]>([]);
    // Tracks the most recent join/leave events
    const [userEvents, setUserEvents] = useState<{ joined?: string, left?: string }>({});
    // List of users currently in the room
    const [users, setUsers] = useState<string[]>([]);
    // Whether the socket is currently connected
    const [isConnected, setIsConnected] = useState(false);
    // Array of all chat messages (system and user)
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    // Ref to store the current user's ID for use in callbacks
    const userIdRef = useRef("");
    // Track recently left users to prevent duplicate leave messages
    const recentlyLeftUsers = useRef<Record<string, number>>({});

    useEffect(() => {
        // Create and connect the socket
        const socketIo = io(SERVER_URL, {
            transports: ["websocket"], // Ensures a clean WebSocket connection
        });

        // Clean up stale entries from recentlyLeftUsers every minute
        const cleanupInterval = setInterval(() => {
            const now = Date.now();
            const staleThreshold = 60000; // 1 minute
            Object.keys(recentlyLeftUsers.current).forEach(userId => {
                if (now - recentlyLeftUsers.current[userId] > staleThreshold) {
                    delete recentlyLeftUsers.current[userId];
                }
            });
        }, 60000);

        // Join the specified chat room
        socketIo.emit("join-room", { roomId, userName });

        // Handle server confirmation of joining
        socketIo.on("joined-room", ({ userId, users }: UserJoinLeaveData) => {
            userIdRef.current = userId;
            setUserId(userId);
            setIsConnected(true);
            setUsers(users || []);
            // Add system message for self join
            setMessages(prev => ([
                ...prev,
                createSystemMessage(userName, `you joined the chat`, true)
            ]));
        });

        // Connection status handlers
        socketIo.on("connect", () => setIsConnected(true));
        socketIo.on("disconnect", () => setIsConnected(false));

        // Handle another user joining
        socketIo.on("user-joined", ({ userId: joinedUser, users }: UserJoinLeaveData) => {
            setUserEvents(e => ({ ...e, joined: joinedUser }));
            setUsers(users || []);
            // Add system message for other user join
            setMessages(prev => ([
                ...prev,
                createSystemMessage(joinedUser, `${joinedUser} joined the chat`, false)
            ]));
        });

        // Handle another user leaving
        socketIo.on("user-left", ({ userId: leftUser, users }: UserJoinLeaveData) => {
            setUserEvents(e => ({ ...e, left: leftUser }));
            setUsers(users || []);
            // Prevent duplicate leave messages for the same user
            const now = Date.now();
            if (recentlyLeftUsers.current[leftUser] && now - recentlyLeftUsers.current[leftUser] < 5000) {
                console.log("Preventing duplicate left message for", leftUser);
                return;
            }
            recentlyLeftUsers.current[leftUser] = now;
            setMessages(prev => {
                // Fallback: check for existing leave message
                const alreadyLeft = prev.some(
                    msg =>
                        msg.type === 'system' &&
                        msg.sender === leftUser &&
                        msg.message === `${leftUser} left the chat`
                );
                if (alreadyLeft) {
                    return prev;
                }
                return [
                    ...prev,
                    createSystemMessage(leftUser, `${leftUser} left the chat`, leftUser === userIdRef.current)
                ];
            });
            console.log("User left:", leftUser, "sss", userIdRef.current);
        });

        // Handle typing indicator events
        socketIo.on("users-typing", ({ userIds }: TypingEventData) => {
            // Only show other users as typing, not yourself
            setUsersTyping(userIds.filter((id: string) => id !== socketIo.id));
        });        // Handle receiving a chat message
        socketIo.on("receive-message", ({ encryptedData, userId, messageId, replyTo }: MessageEventData) => {
            console.log("Message received:", encryptedData, userId, replyTo);
            setMessages(prev => ([
                ...prev,
                createUserMessage(userId, encryptedData, false, messageId, replyTo)
            ]));
        });

        setSocket(socketIo);

        // Cleanup on unmount or dependency change
        return () => {
            if (socketIo.connected) {
                socketIo.emit("leave-room", { roomId, userName });
            }
            socketIo.disconnect();
            clearInterval(cleanupInterval);
        };
    }, [roomId, userName]);    // Send a chat message to the server and add it to local state
    const sendMessage = useCallback((
        encryptedData: string,
        userId: string,
        replyTo?: { message: string; sender?: string; messageId?: string; }
    ) => {
        if (socket) {
            // Generate a unique message ID
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            console.log("Sending message:", encryptedData, userId, replyTo);

            // Send message with optional reply info
            socket.emit("send-message", {
                encryptedData,
                userId,
                messageId,
                replyTo
            });

            // Add message to local state
            setMessages(prev => ([
                ...prev,
                createUserMessage(userId, encryptedData, true, messageId, replyTo)
            ]));

            console.log("Message sent:", messages);
        }
    }, [socket, messages]);

    // Notify the server that the user is typing or stopped typing
    const sendTyping = useCallback((isTyping: boolean) => {
        if (socket && userIdRef.current) {
            socket.emit("user-typing", { userId: userIdRef.current, isTyping });
        }
    }, [socket]);

    // Return all relevant state and actions for chat components
    return { socket, userId, sendMessage, sendTyping, usersTyping, userEvents, users, isConnected, messages, setMessages };
}
