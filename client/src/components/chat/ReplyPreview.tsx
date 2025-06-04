import React from 'react';
import { useReply } from '../../contexts/ReplyContext';
import { renderTextWithLinks } from '../../utils/textFormatUtils';
import { ArrowUp } from 'lucide-react';
import { extractAttachments } from '../../types/chat';
import Image from 'next/image';

interface ReplyPreviewProps {
    message: string;
    sender?: string;
    messageId?: string;
}

/**
 * Reusable reply preview component used in message bubbles
 */
export const ReplyPreview: React.FC<ReplyPreviewProps> = ( { message, sender, messageId } ) => {
    const { setScrollToMessageId } = useReply();
    // Extract any image attachments from the message
    const { text: cleanMessage, attachments } = extractAttachments( message || '' );
    const hasImages = attachments.length > 0;

    const handleClick = () => {
        if ( messageId ) {
            // Set the message ID to scroll to
            setScrollToMessageId( messageId );
        }
    };

    return (
        <div
            className={`mt-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-sm mb-1 border-l-2 border-rose-400 text-[10px] overflow-hidden group transition-all duration-200 
        ${messageId ? 'cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:border-l-4 hover:border-rose-500' : ''} max-h-20`}
            onClick={messageId ? handleClick : undefined}
            title={messageId ? "Click to view original message" : ""}
        >
            <div className="flex items-center">
                <div className="font-semibold text-green-500">{sender ? sender : 'User'}</div>
                {messageId && (
                    <div className="flex items-center">
                        <span className="ml-1 text-[8px] text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            (click to view)
                        </span>
                        <ArrowUp
                            className="h-2.5 w-2.5 ml-0.5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                )}
            </div>
            <div className="flex items-center">
                {hasImages && (
                    <div className="flex-shrink-0 mr-1.5">
                        <div className="relative h-6 w-6">
                            <Image
                                src={attachments[0].url}
                                alt="Image attachment"
                                fill
                                sizes="24px"
                                unoptimized
                                className="object-cover rounded-sm"
                            />
                        </div>
                        {attachments.length > 1 && (
                            <span className="text-[8px] text-zinc-500">+{attachments.length - 1}</span>
                        )}
                    </div>
                )}
                <div className="text-zinc-600 dark:text-zinc-400 line-clamp-1 flex-grow">
                    {cleanMessage ? renderTextWithLinks( cleanMessage ) : hasImages ? '(image)' : ''}
                </div>
            </div>
        </div>
    );
};
