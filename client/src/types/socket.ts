/**
 * Type definitions for Socket.IO-related functionality
 */

import { Socket } from "socket.io-client";
import { Dispatch, SetStateAction } from "react";

// Basic message types
export type MessageType = 'system' | 'user';

// Chat message structure
export interface ChatMessage {
    type: MessageType;
    sender?: string;
    message: string;
    timestamp: string;
    isSent?: boolean;
    messageId?: string;
    replyTo?: {
        messageId?: string;
        message: string;
        sender?: string;
    };
}

// Socket event data types
export interface UserJoinLeaveData {
    userId: string;
    users: string[];
}

export interface TypingEventData {
    userIds: string[];
}

export interface MessageEventData {
    encryptedData: string;
    userId: string;
    messageId?: string;
    replyTo?: {
        messageId?: string;
        message: string;
        sender?: string;
    };
}

// User events tracking
export interface UserEvents {
    joined?: string;
    left?: string;
}

// Socket hook return type
export interface SocketHookReturn {
    socket: Socket | null;
    userId: string;
    sendMessage: (
        encryptedData: string,
        userId: string,
        replyTo?: { message: string; sender?: string; messageId?: string; }
    ) => void;
    sendTyping: (isTyping: boolean) => void;
    usersTyping: string[];
    userEvents: UserEvents;
    users: string[];
    isConnected: boolean;
    messages: ChatMessage[];
    setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}
