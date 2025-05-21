import React, { useState, useRef } from "react";
import { User, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

export const SystemMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => (
  <div className="system-message text-center text-xs text-gray-500 my-3">
    {message}{' '}
    <span className="timestamp text-[10px] text-gray-400">{timestamp}</span>
  </div>
);

export const IncomingMessage: React.FC<{ message: string; timestamp: string, userName:string }> = ({ message, timestamp, userName }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageLength = message.length;
  const isLongMessage = messageLength > 150;
  const messageRef = useRef<HTMLDivElement>(null);
  
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
    return (
    <div className="flex mb-1" ref={messageRef}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1 bg-gray-200 relative">
        {/* Light mode circle */}
        <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
        <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
      </div>      <div 
        className="flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
      >
        <div className="w-full">
          <span className="text-rose-500">{userName}</span>
          <p className="text-xs pt-1 break-words whitespace-pre-line w-full">
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
          <span className="block text-[9px] text-gray-400 mt-0.5">{timestamp}</span>
            {/* Copy button that appears on hover (desktop) or on tap (mobile) */}
          <button
            onClick={handleCopyMessage}
            className={`absolute right-2 bottom-2 ${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
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
      </div>
    </div>
  );
};

export const OutgoingMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageLength = message.length;
  const isLongMessage = messageLength > 150;
  const messageRef = useRef<HTMLDivElement>(null);
  
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
      return (
    <div className="flex justify-end mb-1" ref={messageRef}>      <div 
        className="flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line relative group"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onTouchStart={() => setIsHovering(true)}
      >
        <div className="w-full">
          <span className="text-rose-500">You</span>
          <p className="text-xs pt-1 break-words whitespace-pre-line w-full">
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
          <span className="block text-[9px] text-gray-400 mt-0.5">{timestamp}</span>
          
          {/* Copy button that appears on hover (desktop) or on tap (mobile) */}
          <button
            onClick={handleCopyMessage}
            className={`absolute right-2 bottom-2 ${isHovering ? 'opacity-100' : 'opacity-0 md:group-hover:opacity-100'} transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1.5 md:p-1 touch-manipulation`}
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
      </div>
      <div className="w-6 h-6 rounded-full flex items-center justify-center ml-1 bg-gray-200 relative">
        {/* Light mode circle */}
        <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
        <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
      </div>
    </div>
  );
};
