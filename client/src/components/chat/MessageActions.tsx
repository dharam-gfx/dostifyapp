import React, { useState } from 'react';
import { Reply, Copy, Check, Bot } from 'lucide-react';

interface MessageActionsProps {
    isHovering: boolean;
    onReply: () => void;
    onCopy: () => void;
    onAiReply?: () => void;
    message: string;
    className?: string;
    showAiReply?: boolean;
}

/**
 * Reusable component for message action buttons (reply, copy, AI reply)
 */
export const MessageActions: React.FC<MessageActionsProps> = ({
    isHovering,
    onReply,
    onCopy,
    onAiReply,
    message,
    className = '',
    showAiReply = false
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopyMessage = () => {
        navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 2000);

        // Call the parent's onCopy callback if provided
        if (onCopy) {
            onCopy();
        }
    };

    return (
        <div className={`flex space-x-1 group ${className}`}>
            {/* Reply button */}
            <button
                onClick={onReply}
                className={`${isHovering ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
          transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 touch-manipulation
          dark:bg-gray-800 dark:hover:bg-gray-700`}
                title="Reply"
                aria-label="Reply to message"
            >
                <Reply className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>

            {/* AI Reply button - only shown if enabled */}
            {showAiReply && (
                <button
                    onClick={onAiReply}
                    className={`${isHovering ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
            transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 touch-manipulation
            dark:bg-gray-800 dark:hover:bg-gray-700`}
                    title="Get AI reply suggestion"
                    aria-label="Get AI reply suggestion"
                >
                    <Bot className="h-3 w-3 text-blue-500" />
                </button>
            )}

            {/* Copy button */}
            <button
                onClick={handleCopyMessage}
                className={`${isHovering ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
                transition-opacity bg-gray-100 hover:bg-gray-200 rounded-full p-1 touch-manipulation
                dark:bg-gray-800 dark:hover:bg-gray-700`}
                title="Copy message"
                aria-label="Copy message"
            >
                {copied ? (
                    <Check className="h-3 w-3 text-green-500" />
                ) : (
                    <Copy className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                )}
            </button>
        </div>
    );
};
