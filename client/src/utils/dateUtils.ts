/**
 * Date and time formatting utilities for consistent display across the application
 * Provides helpers for formatting message times, dates, and relative times
 */

/**
 * Format a date to a time string (HH:MM)
 * 
 * @param date Date to format
 * @returns Formatted time string
 */
export function formatMessageTime( date: Date = new Date() ): string {
    return date.toLocaleTimeString( [], { hour: '2-digit', minute: '2-digit' } );
}

/**
 * Format a date for display in message headers (e.g., Today, Yesterday, or formatted date)
 * 
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatMessageDate( date: Date = new Date() ): string {
    // Check if the date is today
    const today = new Date();
    if ( date.toDateString() === today.toDateString() ) {
        return 'Today';
    }

    // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate( yesterday.getDate() - 1 );
    if ( date.toDateString() === yesterday.toDateString() ) {
        return 'Yesterday';
    }

    // Otherwise, return a formatted date
    return date.toLocaleDateString( undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    } );
}

/**
 * Create a timestamp for a chat message
 * 
 * @returns A timestamp string
 */
export function createMessageTimestamp(): string {
    return formatMessageTime();
}

/**
 * Format a relative time (e.g., "2 minutes ago")
 * 
 * @param date The date to format
 * @returns A relative time string
 */
export function formatRelativeTime( date: Date ): string {
    const now = new Date();
    const diffInSeconds = Math.floor( ( now.getTime() - date.getTime() ) / 1000 );

    if ( diffInSeconds < 60 ) {
        return 'just now';
    } else if ( diffInSeconds < 60 * 60 ) {
        const minutes = Math.floor( diffInSeconds / 60 );
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if ( diffInSeconds < 60 * 60 * 24 ) {
        const hours = Math.floor( diffInSeconds / ( 60 * 60 ) );
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
        return formatMessageDate( date );
    }
}