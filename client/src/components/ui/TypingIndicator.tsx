import React from "react";

interface TypingIndicatorProps {
  /** Array of user IDs who are typing */
  typingUsers: string[];
  
  /** Maximum number of users to show in the message */
  maxUsersToShow?: number;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Component that displays who is currently typing
 */
const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  maxUsersToShow = 2,
  className = "",
}) => {
  if (typingUsers.length === 0) {
    return null;
  }
  
  // Create a typing message based on who's typing
  const getUsersText = () => {
    const count = typingUsers.length;
    
    if (count === 1) {
      return (
        <>
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {typingUsers[0].substring(0, 4)}
          </span>
          <span> is typing</span>
        </>
      );
    }
    
    if (count <= maxUsersToShow) {
      const lastUser = typingUsers[count - 1];
      const otherUsers = typingUsers.slice(0, count - 1);
      return (
        <>
          {otherUsers.map((id, index) => (
            <React.Fragment key={id}>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {id.substring(0, 4)}
              </span>
              {index < otherUsers.length - 1 ? ', ' : ' and '}
            </React.Fragment>
          ))}
          <span className="font-semibold text-rose-600 dark:text-rose-400">
            {lastUser.substring(0, 4)}
          </span>
          <span> are typing</span>
        </>
      );
    }
    
    return `${typingUsers.length} people are typing`;
  };
  return (
    <div className={`flex items-end space-x-2 ${className}`}>
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center justify-start border rounded-xl px-4 py-2 bg-gray-50/90 dark:bg-gray-800/50 text-xs text-muted-foreground shadow-sm backdrop-blur-sm w-auto">
          <div className="mr-2.5 text-sm">{getUsersText()}</div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full mr-1 animate-bounce [animation-delay:0s]"></span>
            <span className="w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full mr-1 animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-2 h-2 bg-rose-500 dark:bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;