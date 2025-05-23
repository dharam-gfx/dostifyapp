import React from 'react';
import { X } from 'lucide-react';
import { useReply } from '@/contexts/ReplyContext';

const ReplyBar: React.FC = () => {
    const { replyInfo, clearReply } = useReply();

    if (!replyInfo) return null;

    return (
        <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-t-lg border-b border-gray-200 dark:border-gray-700 relative">
            <div className="flex flex-col max-w-full p-1 pr-8">
                <span className="text-xs font-medium text-rose-500">
                    Replying to {replyInfo.sender || 'Message'}
                </span>
                <p className="text-xs pt-1 text-gray-600 dark:text-gray-400 truncate pr-6">
                    {replyInfo.message}
                </p>
            </div>
            <button
                onClick={clearReply}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Cancel reply"
            >
                <X className="h-4 w-4 text-gray-500" />
            </button>
        </div>
    );
};

export default ReplyBar;
