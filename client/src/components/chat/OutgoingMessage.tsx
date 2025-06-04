import React, { useState, useRef } from 'react';
import { User, ChevronDown, ChevronUp } from 'lucide-react';
import { useReply } from '../../contexts/ReplyContext';
import { renderTextWithLinks } from '../../utils/textFormatUtils';
import { ReplyPreview } from './ReplyPreview';
import { MessageActions } from './MessageActions';
import MessageAttachments from './MessageAttachments';
import { extractAttachments } from '@/types/chat';

interface OutgoingMessageProps {
    message: string;
    timestamp: string;
    messageId?: string;
    replyTo?: {
        message: string;
        sender?: string;
        messageId?: string;
    };
}

/**
 * Outgoing message component for messages sent by the current user
 */
export const OutgoingMessage: React.FC<OutgoingMessageProps> = ( {
    message,
    timestamp,
    messageId,
    replyTo
} ) => {
    const [isExpanded, setIsExpanded] = useState( false );
    const [isHovering, setIsHovering] = useState( false );

    // Extract attachments and clean message text
    const { text: cleanMessage, attachments } = extractAttachments( message );

    const messageLength = cleanMessage.length;
    const isLongMessage = messageLength > 150;
    const messageRef = useRef<HTMLDivElement>( null );
    const { setReplyInfo, setShouldFocusInput } = useReply();

    const handleToggle = () => {
        setIsExpanded( !isExpanded );
        // If collapsing, scroll to the top of this message
        if ( isExpanded && messageRef.current ) {
            setTimeout( () => {
                messageRef.current?.scrollIntoView( { behavior: "smooth", block: "start" } );
            }, 10 );
        }
    }; const handleReply = () => {
        setReplyInfo( {
            message: message, // Use the original message with image attachments
            sender: "You",
            messageId
        } );
        // Set flag to focus the input after setting reply info
        setShouldFocusInput( true );
    };

    return (
        <div className="flex flex-col items-end mb-2" ref={messageRef}>
            <div className="flex justify-end">
                <div
                    className="message-bubble flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line relative"
                    onMouseEnter={() => setIsHovering( true )}
                    onMouseLeave={() => setIsHovering( false )}
                    onTouchStart={() => setIsHovering( true )}
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

                        {/* Message content - now with link support for collapsed view too */}
                        {cleanMessage && (
                            <p className="text-xs pt-1 break-words whitespace-pre-line w-full">
                                {isLongMessage && !isExpanded ? (
                                    <>
                                        {renderTextWithLinks( cleanMessage.substring( 0, 150 ) )}
                                        <span>...</span>
                                    </>
                                ) : renderTextWithLinks( cleanMessage )}
                            </p>
                        )}

                        {/* Display image attachments */}
                        {attachments.length > 0 && (
                            <MessageAttachments attachments={attachments} />
                        )}

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

                        {/* Timestamp inside bubble */}
                        <div className="">
                            <span className="text-[9px] text-gray-400">{timestamp}</span>
                        </div>
                    </div>
                </div>
                <div className="w-6 h-6 rounded-full flex items-center justify-center ml-1 bg-gray-200 relative">
                    {/* Light mode circle */}
                    <span className="absolute inset-0 rounded-full border border-rose-300 dark:border-transparent pointer-events-none"></span>
                    <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
                </div>
            </div>

            {/* Action buttons now completely below bubble, aligned to right */}
            <MessageActions
                isHovering={isHovering}
                onReply={handleReply}
                onCopy={() => { }} // Empty function since copying is handled within MessageActions
                message={message}
                className="mt-0.5 mr-7 justify-end"
                showAiReply={true}
                onAiReply={() => {
                    // Get a reference to the event for triggering AI suggestions
                    const event = new CustomEvent( 'showAiSuggestions', {
                        detail: { message: cleanMessage, messageId }
                    } );
                    // Dispatch the event to be picked up by the ChatControls component
                    document.dispatchEvent( event );
                }}
            />
        </div>
    );
};
