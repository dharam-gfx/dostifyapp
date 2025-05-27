import React, { RefObject } from 'react';
import { cn } from "@/lib/utils";

interface ChatInputProps {
    inputRef: RefObject<HTMLTextAreaElement | null>;
    input: string;
    setInput: ( value: string ) => void;
    sendTyping?: ( isTyping: boolean ) => void;
    handleSend: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ( {
    inputRef,
    input,
    setInput,
    sendTyping,
    handleSend
} ) => {
    // Use useRef for the typing timeout to maintain it between renders
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>( null );

    return (
        <textarea
            ref={inputRef}
            className={cn(
                "border-input placeholder:text-muted-foreground placeholder:text-sm focus-visible:border-ring focus-visible:ring-ring/50",
                "flex rounded-md border px-3 py-2 text-primary w-full resize-none border-none bg-transparent shadow-none outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0 mt-2 ml-2 min-h-[44px] max-h-[150px] text-sm leading-[1.3]"
            )}
            rows={1}
            placeholder="Type your reply..."
            style={{ height: 44 }}
            value={input}
            onChange={e => {
                setInput( e.target.value );

                // Send typing immediately
                if ( e.target.value.length > 0 ) {
                    sendTyping?.( true );
                } else {
                    sendTyping?.( false );
                }        // Clear previous timeout
                if ( typingTimeoutRef.current ) {
                    clearTimeout( typingTimeoutRef.current );
                }

                // Set timeout to stop typing after 2s of inactivity
                typingTimeoutRef.current = setTimeout( () => {
                    sendTyping?.( false );
                    typingTimeoutRef.current = null;
                }, 1500 );
            }}
            onKeyDown={e => {
                if ( e.key === "Enter" && !e.shiftKey ) {
                    e.preventDefault();
                    handleSend();
                    sendTyping?.( false );          // Clear typing timeout on send
                    if ( typingTimeoutRef.current ) {
                        clearTimeout( typingTimeoutRef.current );
                        typingTimeoutRef.current = null;
                    }
                }
            }}
        />
    );
};

export default ChatInput;
