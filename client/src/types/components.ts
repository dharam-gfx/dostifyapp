/**
 * Type definitions for UI component properties
 */
import { FC, SVGProps } from "react";
import { LucideIcon } from "lucide-react";

/**
 * Common props for UI components that can receive additional CSS classes
 */
export interface ClassNameProps {
    /** Additional CSS classes */
    className?: string;
}

/**
 * Props for the TypingIndicator component
 */
export interface TypingIndicatorProps {
    /** Array of user IDs who are typing */
    typingUsers: string[];

    /** Maximum number of users to show in the message */
    maxUsersToShow?: number;

    /** Additional CSS classes */
    className?: string;
}

/**
 * Interface for tab items in tabbed components
 */
export interface TabItem {
    /** Display name of the tab */
    name: string;

    /** Value used as the tab's identifier */
    value: string;

    /** Lucide icon to display for the tab */
    icon: LucideIcon;

    /** Component to render inside the tab */
    content?: FC;

    /** Additional CSS classes for the tab content */
    className?: string;
}

/**
 * Interface for theme selector options
 */
export interface ThemeOption {
    /** Theme value (light, dark, system) */
    value: string;

    /** Display label */
    label: string;

    /** Icon component */
    icon: FC<SVGProps<SVGSVGElement>>;
}

/**
 * Props for the ChatControls component
 */
export interface ChatControlsProps {
    /** Current input value */
    input: string;

    /** Function to update input */
    setInput: ( val: string ) => void;    /** Handler for sending messages */
    onSend: (content?: string) => void;

    /** Whether the chat is connected to the server */
    isConnected?: boolean;

    /** Function to send typing status updates */
    sendTyping?: ( isTyping: boolean ) => void;
}

/**
 * Props for the ChatRoomHeader component
 */
export interface ChatRoomHeaderProps {
    /** Unique identifier for the chat room */
    roomId?: string;

    /** Whether the chat is connected to the server */
    isConnected?: boolean;

    /** Number of users in the room */
    userCount?: number;
}
