/**
 * Type definitions for chat-related interfaces
 */

/**
 * Represents a chat message in the application
 */
export interface ChatMessage {
  /** The type of message: system notification or user message */
  type: 'system' | 'message';

  /** The user ID of the message sender */
  sender?: string;

  /** The message content */
  message: string;

  /** The formatted timestamp string */
  timestamp: string;

  /** Whether the message was sent by the current user */
  isSent?: boolean;

  /** Unique ID for the message to prevent duplicates */
  messageId?: string;
}

/**
 * Represents a chat user in the presence channel
 */
export interface ChatUser {
  /** The user ID */
  id: string;
  /** Optional user info */
  info?: {
    name?: string;
    avatar?: string;
    [key: string]: unknown;
  };
}

/**
 * Props for the ChatFeed component
 */
export interface ChatFeedProps {
  /** Array of messages to display */
  messages: ChatMessage[];

  /** Ref to scroll to the latest message */
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Props for the ChatControls component
 */
export interface ChatControlsProps {
  /** Current input value */
  input: string;

  /** Function to update input */
  setInput: ( val: string ) => void;

  /** Handler for sending messages */
  onSend: () => void;
}

/**
 * Connection health status type
 */
export type ConnectionHealthStatus = 'healthy' | 'connected' | 'disconnected';

/**
 * Props for the ChatRoomHeader component
 */
export interface ChatRoomHeaderProps {
  /** Number of users in the chat */
  userCount?: number;

  /** Unique code for the chat room */
  chatCode?: string;

  /** Whether the chat is connected */
  isConnected?: boolean;

  /** More detailed connection health status */
  connectionHealth?: ConnectionHealthStatus;
}

/**
 * Props for message bubble components
 */
export interface MessageBubbleProps {
  /** The message content */
  message: string;

  /** Formatted timestamp string */
  timestamp: string;
}

/**
 * Options for the usePusherChat hook
 */
export interface UsePusherChatOptions {
  /** The unique code for the chat room */
  chatCode: string;

  /** The current user's ID */
  userId: string;

  /** Callback when users list changes */
  onUsersChange: ( users: string[] | ( ( prev: string[] ) => string[] ) ) => void;

  /** Callback when a new message is received */
  onMessageReceived: ( message: ChatMessage, isClientEvent: boolean ) => void;

  /** Callback when typing status is received */
  onTypingStatusUpdate?: ( userId: string, isTyping: boolean ) => void;
}

/**
 * Connection information object returned by usePusherChat
 */
export interface ConnectionInfo {
  /** Whether the connection is established */
  isConnected: boolean;

  /** Whether the channel subscription is complete */
  isFullySubscribed: boolean;

  /** Whether client events are supported on this connection */
  clientEventsSupported: boolean;

  /** The current Pusher connection state */
  connectionState: string;
}

/**
 * Typing status update event
 */
export interface TypingStatusEvent {
  /** User ID of the person typing */
  userId: string;

  /** Whether the user is currently typing */
  isTyping: boolean;
}
