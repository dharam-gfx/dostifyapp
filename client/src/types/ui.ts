/**
 * Common UI-related type definitions
 */
import { ReactNode } from 'react';

/**
 * Common props interface for components that accept children
 */
export interface ChildrenProps {
    /** React children nodes */
    children: ReactNode;
}

/**
 * Common props for modal/dialog components
 */
export interface ModalProps {
    /** Modal title text */
    title?: string;

    /** Modal description text */
    description?: string;

    /** Whether the modal is currently open */
    open?: boolean;

    /** Function to call when the modal should be closed */
    onClose?: () => void;

    /** Content to render inside the modal */
    children?: ReactNode;
}

/**
 * Props for responsive layout components
 */
export interface LayoutProps {
    /** React children nodes */
    children: ReactNode;

    /** Optional classnames to apply to the component */
    className?: string;

    /** Additional layout-specific properties */
    [key: string]: unknown;
}

/**
 * Props for avatar/profile components
 */
export interface AvatarProps {
    /** User or entity name */
    name?: string;

    /** URL to the avatar image */
    src?: string;

    /** Alternative text for the avatar */
    alt?: string;

    /** Size of the avatar (can be 'sm', 'md', 'lg', etc.) */
    size?: 'sm' | 'md' | 'lg' | string;

    /** Optional classname for styling */
    className?: string;

    /** Whether to show online status indicator */
    showStatus?: boolean;

    /** Online status if showStatus is true */
    isOnline?: boolean;
}

/**
 * Props for form input components
 */
export interface InputProps {
    /** Input field name */
    name?: string;

    /** Input label text */
    label?: string;

    /** Input placeholder text */
    placeholder?: string;

    /** Current input value */
    value?: string;

    /** Function to call when input changes */
    onChange?: ( value: string ) => void;

    /** Type of the input (text, password, email, etc.) */
    type?: string;

    /** Whether the input is disabled */
    disabled?: boolean;

    /** Error message to display */
    error?: string;

    /** Additional CSS classes */
    className?: string;
}

/**
 * Props for button components
 */
export interface ButtonProps {
    /** Button variant/style */
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link' | 'destructive';

    /** Button size */
    size?: 'default' | 'sm' | 'lg' | 'icon';

    /** Click handler function */
    onClick?: () => void;

    /** Whether the button is disabled */
    disabled?: boolean;

    /** Whether the button is currently loading */
    loading?: boolean;

    /** Button content */
    children?: ReactNode;

    /** Additional CSS classes */
    className?: string;

    /** HTML type attribute */
    type?: 'button' | 'submit' | 'reset';
}

/**
 * Props for range slider components
 */
export interface SliderProps {
    value: number[];
    onChange: ( value: number[] ) => void;
}
