import React, { useMemo, useState, useEffect } from "react";
import { TypingIndicatorProps } from "@/types/components";

// Constants
const USERNAME_MAX_LENGTH = 10;
const MOBILE_USERNAME_MAX_LENGTH = 6; // Shorter for mobile
const DOT_CLASSES = "w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full animate-bounce";
const USERNAME_CLASSES = "font-semibold text-rose-600 dark:text-rose-400";

/**
 * Truncate username to specified length with ellipsis if needed
 */
const truncateUsername = ( username: string, isMobileView = false, maxLength = USERNAME_MAX_LENGTH ): string => {
  // Use a shorter length on mobile
  const actualMaxLength = isMobileView ? MOBILE_USERNAME_MAX_LENGTH : maxLength;
  return username.length > actualMaxLength ? `${username.substring( 0, actualMaxLength )}...` : username;
};

/**
 * Component that displays who is currently typing
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ( {
  typingUsers,
  maxUsersToShow = 2,
  className = "",
} ) => {
  // Track mobile state for responsive rendering
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  // Set up resize listener to update mobile state
  useEffect( () => {
    const checkIfMobile = () => {
      setIsMobile( window.innerWidth < 640 );
    };

    // Set up event listener for window resize
    window.addEventListener( 'resize', checkIfMobile );

    // Clean up
    return () => window.removeEventListener( 'resize', checkIfMobile );
  }, [] );

  // Memoize the typing message for performance
  const typingMessage = useMemo( () => {
    // Return null representation when no one is typing
    if ( !typingUsers.length ) {
      return null;
    }
    const count = typingUsers.length;
    // On mobile with more than 1 user typing, show simpler message
    if ( isMobile && count > 1 ) {
      // On mobile, show the first user and the count for others
      if ( count <= 3 ) {
        return (
          <>
            <span className={USERNAME_CLASSES}>
              {truncateUsername( typingUsers[0], isMobile )}
            </span>
            <span> & {count - 1} others typing</span>
          </>
        );
      }
      return `${count} people are typing`;
    }
    if ( count === 1 ) {
      return (
        <>
          <span className={USERNAME_CLASSES}>
            {truncateUsername( typingUsers[0], isMobile )}
          </span>
          <span className="text-xs"> is typing</span>
        </>
      );
    }

    if ( count <= maxUsersToShow ) {
      const lastUser = typingUsers[count - 1];
      const otherUsers = typingUsers.slice( 0, count - 1 );

      return (
        <>
          {otherUsers.map( ( username, index ) => (
            <React.Fragment key={username}>
              <span className={USERNAME_CLASSES}>
                {truncateUsername( username, isMobile )}
              </span>
              {index < otherUsers.length - 1 ? ', ' : ' and '}
            </React.Fragment>
          ) )}
          <span className={USERNAME_CLASSES}>
            {truncateUsername( lastUser, isMobile )}
          </span>
          <span> are typing</span>
        </>
      );
    }
    return `${count} people are typing`;
  }, [typingUsers, maxUsersToShow, isMobile] );

  // Return null if no one is typing (based on memoized calculation)
  if ( !typingMessage ) {
    return null;
  } return (
    <div className={`flex items-end space-x-2 ${className}`}>
      <div className="flex flex-col items-start w-full">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-start border rounded-xl px-2.5 sm:px-4 py-1 sm:py-2 bg-gray-50/90 dark:bg-gray-800/50 text-xs text-muted-foreground shadow-sm backdrop-blur-sm w-auto max-w-full">
          <div className="mr-2 sm:mr-2.5 text-sm line-clamp-1 overflow-hidden text-ellipsis">{typingMessage}</div>
          <div className="flex items-center mt-1 sm:mt-2 shrink-0 ml-auto">
            <span className={`${DOT_CLASSES} w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1 [animation-delay:0s]`}></span>
            <span className={`${DOT_CLASSES} w-1.5 h-1.5 sm:w-2 sm:h-2 mr-1 [animation-delay:0.15s]`}></span>
            <span className={`${DOT_CLASSES} w-1.5 h-1.5 sm:w-2 sm:h-2 [animation-delay:0.3s]`}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo( TypingIndicator );