// filepath: c:\Users\kdharmendra\Desktop\dostifyapp nextjs\dostifyapp\client\src\components\chat\ChatInput.tsx
import React, { RefObject, useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { getAiRewrittenText } from '@/services/aiService';

interface ChatInputProps {
    inputRef: RefObject<HTMLTextAreaElement | null>;
    input: string;
    setInput: ( value: string ) => void;
    sendTyping?: ( isTyping: boolean ) => void;
    handleSend: () => void;
}

type RewriteStyle = 'formal' | 'casual' | 'friendly' | 'professional';

const REWRITE_STYLES = [
    { label: "Casual", style: "casual" },
    { label: "Formal", style: "formal" },
    { label: "Friendly", style: "friendly" },
    { label: "Professional", style: "professional" }
];

const TYPING_TIMEOUT_MS = 1500;
const NOTIFICATION_TIMEOUT_MS = 3000;

const ChatInput: React.FC<ChatInputProps> = ( {
    inputRef,
    input,
    setInput,
    sendTyping,
    handleSend
} ) => {
    const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>( null );
    const dropdownRef = useRef<HTMLDivElement>( null );

    // State management
    const [isRewriting, setIsRewriting] = useState( false );
    const [showStylesDropdown, setShowStylesDropdown] = useState( false );
    const [rewriteError, setRewriteError] = useState<string | null>( null );
    const [wasRewritten, setWasRewritten] = useState( false );
    const [originalText, setOriginalText] = useState<string | null>( null );

    // Function to undo the rewrite and restore original text - memoized with useCallback
    const handleUndo = React.useCallback( () => {
        if ( originalText !== null ) {
            setInput( originalText );
            setOriginalText( null );
            setWasRewritten( false );

            // Focus the textarea after undoing
            if ( inputRef.current ) {
                inputRef.current.focus();
            }
        }
    }, [originalText, setInput, inputRef] );

    // Close dropdown when clicking outside
    useEffect( () => {
        function handleClickOutside( event: MouseEvent ) {
            if ( dropdownRef.current && !dropdownRef.current.contains( event.target as Node ) ) {
                setShowStylesDropdown( false );
            }
        }

        document.addEventListener( "mousedown", handleClickOutside );
        return () => {
            document.removeEventListener( "mousedown", handleClickOutside );
        };
    }, [] );

    // Add keyboard event listener for Ctrl+Z
    useEffect( () => {
        function handleKeyDown( event: KeyboardEvent ) {
            // Check for Ctrl+Z (or Command+Z for Mac)
            if ( ( event.ctrlKey || event.metaKey ) && event.key === 'z' || event.key === 'Z' ) {
                if ( originalText !== null ) {
                    // Get the active element to see if textarea is focused
                    const activeElement = document.activeElement;
                    const textareaElement = inputRef.current;

                    // Only prevent default and handle our custom undo if:
                    // 1. The textarea is not focused, or
                    // 2. The textarea is focused but has no edit history to undo
                    if ( activeElement !== textareaElement || textareaElement?.value === input ) {
                        event.preventDefault();
                        handleUndo();
                    }
                }
            }
        }

        document.addEventListener( 'keydown', handleKeyDown );
        return () => {
            document.removeEventListener( 'keydown', handleKeyDown );
        };
    }, [originalText, input, inputRef, handleUndo] );

    // Function to handle AI rewrite of the input text
    const handleAiRewrite = React.useCallback( async ( style: RewriteStyle = 'casual' ) => {
        if ( !input.trim() || isRewriting ) return;

        setIsRewriting( true );
        setShowStylesDropdown( false );
        setRewriteError( null );

        // Save original text before rewriting
        setOriginalText( input );

        try {
            console.log( `Rewriting text in ${style} style...` );
            const { rewrittenText } = await getAiRewrittenText( input, style );

            if ( rewrittenText && rewrittenText !== input ) {
                setInput( rewrittenText );
                setWasRewritten( true );

                // Reset the "rewritten" indicator after a timeout
                setTimeout( () => {
                    setWasRewritten( false );
                }, NOTIFICATION_TIMEOUT_MS );
            }
        } catch ( error ) {
            console.error( "Error rewriting text:", error );
            setRewriteError( "Failed to rewrite text. Please try again later." );

            // Clear error after a timeout
            setTimeout( () => {
                setRewriteError( null );
            }, NOTIFICATION_TIMEOUT_MS );
        } finally {
            setIsRewriting( false );
        }
    }, [input, isRewriting, setInput] );

    // Function to handle typing and sending typing status
    const handleTyping = ( e: React.ChangeEvent<HTMLTextAreaElement> ) => {
        const newValue = e.target.value;
        setInput( newValue );

        // Reset rewritten flag when user types
        if ( wasRewritten ) {
            setWasRewritten( false );
        }

        // Clear original text if the current text is significantly different
        if ( originalText &&
            ( Math.abs( newValue.length - originalText.length ) > originalText.length * 0.5 ||
                newValue.trim() === '' ) ) {
            setOriginalText( null );
        }

        // Send typing immediately
        if ( newValue.length > 0 ) {
            sendTyping?.( true );
        } else {
            sendTyping?.( false );
        }

        // Clear previous timeout
        if ( typingTimeoutRef.current ) {
            clearTimeout( typingTimeoutRef.current );
        }

        // Set timeout to stop typing after inactivity
        typingTimeoutRef.current = setTimeout( () => {
            sendTyping?.( false );
            typingTimeoutRef.current = null;
        }, TYPING_TIMEOUT_MS );
    };

    // Function to handle key presses in the input
    const handleKeyDown = ( e: React.KeyboardEvent ) => {
        if ( e.key === "Enter" && !e.shiftKey ) {
            e.preventDefault();
            handleSend();
            sendTyping?.( false );
            // Clear typing timeout on send
            if ( typingTimeoutRef.current ) {
                clearTimeout( typingTimeoutRef.current );
                typingTimeoutRef.current = null;
            }
        }
    };

    return (
        <div className="relative w-full">
            <textarea
                ref={inputRef}
                className={cn(
                    "border-input placeholder:text-muted-foreground placeholder:text-sm focus-visible:border-ring focus-visible:ring-ring/50",
                    "flex rounded-md border px-3 py-2 pr-11 text-primary w-full resize-none border-none bg-transparent shadow-none outline-none",
                    "focus-visible:ring-0 focus-visible:ring-offset-0 mt-2 ml-2 min-h-[44px] max-h-[150px] text-sm leading-[1.3]",
                    isRewriting ? "opacity-70" : ""
                )}
                rows={1}
                placeholder="Type your reply..."
                style={{ height: 44 }}
                value={input}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                disabled={isRewriting}
            />

            {/* AI Rewrite Menu */}
            {input.trim().length > 0 && (
                <div className="absolute right-3 bottom-2 flex items-center group">
                    {/* AI Rewrite tooltip */}
                    <div className="absolute bottom-full right-0 mb-8 hidden group-hover:block">
                        <div className="bg-zinc-800 text-zinc-100 dark:bg-zinc-700 dark:text-zinc-100 text-xs rounded-md py-1 px-2 shadow-lg">
                            Let AI rewrite your message
                        </div>
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        {/* AI Rewrite button */}
                        <button
                            onClick={() => setShowStylesDropdown( prev => !prev )}
                            className={cn(
                                "text-xs font-medium rounded-full px-2 py-0.5 transition-all duration-300",
                                isRewriting
                                    ? "opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                                    : "bg-gradient-to-r from-rose-50 to-indigo-50 dark:from-rose-900/30 dark:to-indigo-900/30 text-rose-600 dark:text-rose-400 hover:from-rose-100 hover:to-indigo-100 dark:hover:from-rose-900/40 dark:hover:to-indigo-900/40 shadow-sm"
                            )}
                            disabled={isRewriting || !input.trim()}
                            title="AI rewrite text"
                        >
                            {isRewriting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin h-3 w-3 border-2 border-indigo-300 dark:border-indigo-500 border-t-transparent rounded-full mr-1"></div>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Rewriting...</span>
                                </div>
                            ) : "✨"}
                        </button>

                        {/* Dropdown for rewrite styles */}
                        {showStylesDropdown && !isRewriting && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 py-1 min-w-[120px] z-10">
                                <div className="text-xs font-medium text-zinc-400 px-3 py-1 border-b border-zinc-200 dark:border-zinc-800">
                                    Rewrite as:
                                </div>
                                {REWRITE_STYLES.map( ( option ) => (
                                    <button
                                        key={option.style}
                                        onClick={() => handleAiRewrite( option.style as RewriteStyle )}
                                        className="block w-full text-left px-3 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    >
                                        {option.label}
                                    </button>
                                ) )}
                            </div>
                        )}
                        {/* Success indicator - Show when text has been rewritten */}
                        {wasRewritten && originalText !== null && !isRewriting && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-800 py-2 px-3 z-10 animate-fade-in-out">
                                <div className="flex flex-col">
                                    <div className="flex items-center">
                                        <span className="text-green-500 mr-1">✓</span>
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">
                                            Text rewritten
                                        </span>
                                    </div>
                                    <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 italic">
                                        Press Ctrl+Z to undo
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error indicator */}
                        {rewriteError && !isRewriting && (
                            <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-zinc-900 rounded-md shadow-lg border border-red-200 dark:border-red-900 py-2 px-3 z-10 animate-fade-in-out">
                                <div className="flex items-center">
                                    <span className="text-red-500 mr-1">⚠️</span>
                                    <span className="text-xs text-red-600 dark:text-red-400">{rewriteError}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInput;
