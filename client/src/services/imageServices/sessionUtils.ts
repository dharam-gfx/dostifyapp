/**
 * Utilities for managing image session IDs
 */

/**
 * Get the current session ID for this chat
 * This could be the room ID or a user-specific session ID
 */
export const getSessionId = (): string => {
  // Try to get room ID from URL if available
  const path = window.location.pathname;
  const matches = path.match( /\/chat\/([^\/]+)/ );

  if ( matches && matches[1] ) {
    return matches[1]; // Return the room ID
  }

  // If no room ID found, use a local session ID from localStorage
  let sessionId = localStorage.getItem( 'chat_session_id' );
  if ( !sessionId ) {
    // Generate a new session ID
    sessionId = `session_${Math.random().toString( 36 ).substring( 2, 15 )}`;
    localStorage.setItem( 'chat_session_id', sessionId );
  }

  return sessionId;
};
