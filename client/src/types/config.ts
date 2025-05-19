/**
 * Types for metadata and configuration
 */
import type { Metadata as NextMetadata } from "next";

/**
 * Extended metadata interface for Next.js
 */
export interface Metadata extends NextMetadata {
    /** OpenGraph metadata for social sharing */
    openGraph?: {
        /** Page title for social sharing */
        title?: string;

        /** Page description for social sharing */
        description?: string;

        /** URL for social sharing */
        url?: string;

        /** Images for social sharing */
        images?: { url: string }[];

        /** Site name for social sharing */
        siteName?: string;
    };

    /** Twitter card metadata */
    twitter?: {
        /** Twitter card type */
        card?: string;

        /** Page title for Twitter */
        title?: string;

        /** Page description for Twitter */
        description?: string;

        /** Images for Twitter */
        images?: string[];
    };
}

/**
 * Window interface augmentation for browser-specific APIs
 */
export interface WindowWithAudioContext {
    /** Webkit-specific audio context */
    webkitAudioContext?: typeof AudioContext;
}

/**
 * Environment configuration
 */
export interface EnvironmentConfig {
    /** Server URL */
    SERVER_URL: string;

    /** API key (if applicable) */
    API_KEY?: string;

    /** Debug mode flag */
    DEBUG_MODE?: boolean;
}

/**
 * App settings type
 */
export interface AppSettings {
    /** Theme preference */
    theme: 'light' | 'dark' | 'system';

    /** Sound enabled flag */
    soundEnabled: boolean;

    /** Notification settings */
    notifications: {
        /** New message notifications */
        newMessage: boolean;

        /** User join/leave notifications */
        userPresence: boolean;
    };

    /** Privacy settings */
    privacy: {
        /** Share typing status */
        shareTypingStatus: boolean;

        /** Share read receipts */
        shareReadReceipts: boolean;
    };
}
