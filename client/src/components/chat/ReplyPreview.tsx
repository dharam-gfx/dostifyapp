import React from 'react';
import { useReply } from '../../contexts/ReplyContext';
import { renderTextWithLinks } from '../../utils/textFormatUtils';

interface ReplyPreviewProps {
  message: string;
  sender?: string;
  messageId?: string;
}

/**
 * Reusable reply preview component used in message bubbles
 */
export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ message, sender, messageId }) => {
  const { setScrollToMessageId } = useReply();
  
  const handleClick = () => {
    if (messageId) {
      // Set the message ID to scroll to
      setScrollToMessageId(messageId);
    }
  };
  
  return (
    <div 
      className={`mt-1.5 bg-gray-100 dark:bg-gray-800 p-1.5 rounded-sm mb-1 border-l-2 border-blue-400 text-[10px] max-h-10 overflow-hidden group transition-all duration-200 
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
      <div className="text-gray-600 dark:text-gray-400 line-clamp-1">{renderTextWithLinks(message)}</div>
    </div>
  );
};
