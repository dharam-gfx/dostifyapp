import React, { useState, useRef } from "react";
import { User, ChevronDown, ChevronUp, Copy, Check, Reply } from "lucide-react";
import { useReply } from "../../contexts/ReplyContext";

export const SystemMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => (
  <div className="system-message text-center text-xs text-gray-500 my-3">
    {message}{' '}
    <span className="timestamp text-[10px] text-gray-400">{timestamp}</span>
  </div>
);

// Reusable reply preview component
const ReplyPreview: React.FC<{ 
  message: string; 
  sender?: string; 
  messageId?: string; 
}> = ({ message, sender, messageId }) => {
  const { setScrollToMessageId } = useReply();
  
  const handleClick = () => {
    if (messageId) {
      // Set the message ID to scroll to
      setScrollToMessageId(messageId);
    }
  };  return (
    <div 
      className={`mt-2 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-sm mb-1 border-l-2 border-blue-400 text-[10px] max-h-10 overflow-hidden group transition-all duration-200 
        ${messageId ? 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-l-4 hover:border-blue-500' : ''}`}
      onClick={messageId ? handleClick : undefined}
      title={messageId ? "Click to view original message" : ""}
    >
      <div className="flex items-center">
        <div className="font-semibold text-blue-500">{sender ? sender : 'User'}</div>
        {messageId && (
          <div className="flex items-center">
            <span className="ml-1 text-[8px] text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
              (click to view)
            </span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-2.5 w-2.5 ml-0.5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        )}
      </div>
      <div className="text-gray-600 dark:text-gray-400 line-clamp-1">{message}</div>
    </div>
  );
};

export const IncomingMessage: React.FC<{
  message: string;
  timestamp: string;
  userName: string;
  messageId?: string;
  replyTo?: { message: string; sender?: string; messageId?: string; }
}> = ({ message, timestamp, userName, messageId, replyTo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageLength = message.length;
  const isLongMessage = messageLength > 150;
  const messageRef = useRef<HTMLDivElement>(null);
  const { setReplyInfo, setShouldFocusInput } = useReply();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    // If collapsing, scroll to the top of this message
    if (isExpanded && messageRef.current) {
      setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 10);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const handleReply = () => {
    setReplyInfo({
      message,
      sender: userName,
      messageId
    });
    // Set flag to focus the input after setting reply info
    setShouldFocusInput(true);
  };

  return (
    <div className="flex mb-1" ref={messageRef}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1 bg-gray-200 relative">
        {/* Light mode circle */}
        <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
        <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
      </div>
      <div
        className="flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
      >
        <div className="w-full">
          <span className="text-rose-500">{userName}</span>
          
          {/* Show reply preview if this message is a reply */}
          {replyTo && (
            <ReplyPreview 
              message={replyTo.message} 
              sender={replyTo.sender} 
              messageId={replyTo.messageId}
            />
          )}

          {/* Action buttons on hover - moved to top-right */}
          <div className="absolute right-2 top-2 flex space-x-1">
            {/* Reply button */}
            <button
              onClick={handleReply}
              className={`${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
              title="Reply"
              aria-label="Reply to message"
            >
              <Reply className="h-3.5 w-3.5 md:h-3 md:w-3 text-gray-500" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyMessage}
              className={`${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 md:h-3 md:w-3 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 md:h-3 md:w-3 text-gray-500" />
              )}
            </button>
          </div>

          {/* Message content with right padding to avoid overlap with buttons */}
          <p className="text-xs pt-1 pr-16 break-words whitespace-pre-line w-full">
            {isLongMessage && !isExpanded ? message.substring(0, 150) + "..." : message}
          </p>
          {isLongMessage && (
            <button
              onClick={handleToggle}
              className="text-[10px] text-blue-500 mt-1 hover:underline flex items-center font-bold"
            >
              {isExpanded ? (
                <>Less <ChevronUp className="h-3 w-3 ml-1" /></>
              ) : (
                <>Read more <ChevronDown className="h-3 w-3 ml-1" /></>
              )}
            </button>
          )}
          <span className="block text-[9px] text-gray-400 mt-1.5 mb-1">{timestamp}</span>
        </div>
      </div>
    </div>
  );
};

export const OutgoingMessage: React.FC<{
  message: string;
  timestamp: string;
  messageId?: string;
  replyTo?: { message: string; sender?: string; messageId?: string; }
}> = ({ message, timestamp, messageId, replyTo }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageLength = message.length;
  const isLongMessage = messageLength > 150;
  const messageRef = useRef<HTMLDivElement>(null);
  const { setReplyInfo, setShouldFocusInput } = useReply();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    // If collapsing, scroll to the top of this message
    if (isExpanded && messageRef.current) {
      setTimeout(() => {
        messageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 10);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  const handleReply = () => {
    setReplyInfo({
      message,
      sender: "You",
      messageId
    });
    // Set flag to focus the input after setting reply info
    setShouldFocusInput(true);
  };

  return (
    <div className="flex justify-end mb-1" ref={messageRef}>
      <div
        className="flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
      >
        <div className="w-full">
          <span className="text-rose-500">You</span>

          {/* Show reply preview if this message is a reply */}
          {replyTo && (
            <ReplyPreview 
              message={replyTo.message} 
              sender={replyTo.sender} 
              messageId={replyTo.messageId}
            />
          )}

          {/* Action buttons on hover - moved to top-right */}
          <div className="absolute right-2 top-2 flex space-x-1">
            {/* Reply button */}
            <button
              onClick={handleReply}
              className={`${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
              title="Reply"
              aria-label="Reply to message"
            >
              <Reply className="h-3.5 w-3.5 md:h-3 md:w-3 text-gray-500" />
            </button>

            {/* Copy button */}
            <button
              onClick={handleCopyMessage}
              className={`${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 md:h-3 md:w-3 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 md:h-3 md:w-3 text-gray-500" />
              )}
            </button>
          </div>

          {/* Message content with right padding to avoid overlap with buttons */}
          <p className="text-xs pt-1 pr-16 break-words whitespace-pre-line w-full">
            {isLongMessage && !isExpanded ? message.substring(0, 150) + "..." : message}
          </p>
          {isLongMessage && (
            <button
              onClick={handleToggle}
              className="text-[10px] text-blue-500 mt-1 hover:underline flex items-center font-bold"
            >
              {isExpanded ? (
                <>Less <ChevronUp className="h-3 w-3 ml-1" /></>
              ) : (
                <>Read more <ChevronDown className="h-3 w-3 ml-1" /></>
              )}
            </button>
          )}
          <span className="block text-[9px] text-gray-400 mt-1.5 mb-1">{timestamp}</span>
        </div>
      </div>
      <div className="w-6 h-6 rounded-full flex items-center justify-center ml-1 bg-gray-200 relative">
        {/* Light mode circle */}
        <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
        <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
      </div>
    </div>
  );
};
