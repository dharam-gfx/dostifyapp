/**
 * Centralized exports of all types in the application
 * This file allows importing multiple types from a single source
 */

// Socket and communication types
export * from './socket';

// Chat-related types - excluding duplicates that are in socket.ts
export type {
    // Re-export everything except ChatMessage which clashes with socket.ts
    ChatUser,
    ChatFeedProps,
    // Skip ChatControlsProps & ChatRoomHeaderProps as they're in components.ts
    ConnectionHealthStatus,
    MessageBubbleProps,
    UsePusherChatOptions,
    ConnectionInfo,
    TypingStatusEvent
} from './chat';

// UI component types
export * from './components';

// User events
export * from './userEvents';

// General UI types
export * from './ui';

// Configuration and metadata
export * from './config';

// Redux state types
export * from './redux';

// Message utility types
export * from './messageUtils';
