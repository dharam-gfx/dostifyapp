/**
 * Type definitions for Redux state management
 */
import { ChatMessage } from './chat';

/**
 * Chat slice state interface
 */
export interface ChatState {
    /** List of chat messages */
    messages: ChatMessage[]; // Using the ChatMessage type from chat.ts
    /** List of active users */
    users: string[];

    /** List of users currently typing */
    typingUsers: string[];

    /** Whether the chat is connected */
    isConnected: boolean;

    /** Detailed connection health status */
    connectionHealth: 'healthy' | 'connected' | 'disconnected';

    /** Whether the channel is fully subscribed */
    isFullySubscribed: boolean;

    /** Whether client events are supported */
    clientEventsSupported: boolean;

    /** The current connection state */
    connectionState: string;

    /** The current chat code/room */
    chatCode: string;
}

/**
 * Sound preferences slice state
 */
export interface SoundState {
    /** Whether sound is enabled */
    value: boolean;
}

/**
 * Action payload types
 */
export interface ConnectionInfoPayload {
    /** Whether the connection is established */
    isConnected: boolean;

    /** Whether the channel subscription is complete */
    isFullySubscribed: boolean;

    /** Whether client events are supported */
    clientEventsSupported: boolean;

    /** The current connection state string */
    connectionState: string;
}

/**
 * Common Redux action types with payloads
 */
export interface ActionWithPayload<T = unknown> {
    /** Action type */
    type: string;

    /** Action payload */
    payload: T;
}
