"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Type for the typing indicators state object
 * Maps user IDs to their typing status with an expiry timestamp
 */
type TypingIndicatorsState = Record<string, { isTyping: boolean; expiresAt: number }>;

/**
 * Hook to manage typing indicators for multiple users
 * 
 * @param expiryTime Time in ms before a typing indicator expires
 * @returns Object with typing state and update functions
 */
export function useTypingIndicators(expiryTime = 3000) {
  // Track typing status for each user with expiry timestamps
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorsState>({});
  
  // Store timeouts to clear them if needed
  const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  /**
   * Set a user's typing status
   * 
   * @param userId ID of the user who is typing
   * @param isTyping Whether the user is currently typing
   */
  const setUserTyping = (userId: string, isTyping: boolean) => {
    // Clear existing timeout for this user if any
    if (timeoutsRef.current[userId]) {
      clearTimeout(timeoutsRef.current[userId]);
      delete timeoutsRef.current[userId];
    }
    
    if (isTyping) {
      // Set typing status with expiry time
      const expiresAt = Date.now() + expiryTime;
      
      setTypingUsers(prev => ({
        ...prev,
        [userId]: { isTyping: true, expiresAt }
      }));
      
      // Set timeout to clear typing status after expiry
      timeoutsRef.current[userId] = setTimeout(() => {
        setTypingUsers(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });
      }, expiryTime);
    } else {
      // Clear typing status immediately
      setTypingUsers(prev => {
        const newState = { ...prev };
        delete newState[userId];
        return newState;
      });
    }
  };
  
  // Get array of currently typing users
  const currentlyTypingUsers = Object.entries(typingUsers)
    .filter(([, data]) => data.isTyping && data.expiresAt > Date.now())
    .map(([userId]) => userId);
  
  // Cleanup timeouts on unmount
  useEffect(() => {
    // Store current timeouts to avoid stale reference in cleanup
    const timeouts = timeoutsRef.current;
    
    return () => {
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, []);
  
  return {
    typingUsers: currentlyTypingUsers,
    setUserTyping
  };
}
