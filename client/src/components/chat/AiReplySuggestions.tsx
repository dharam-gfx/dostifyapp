import React, { useEffect, useState, useRef } from 'react';
import { getAiReplySuggestions } from '../../services/aiService';

interface AiReplySuggestionsProps {
    message: string;  // The message to generate replies for
    conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system', content: string }>; // Optional conversation history for better context
    onSelectSuggestion: ( suggestion: string ) => void;
    onClose: () => void;
    visible: boolean;
}

/**
 * Component displaying AI-generated reply suggestions as pills in a horizontal scroll
 * Uses a simple dummy implementation to generate contextual suggestions
 */
export const AiReplySuggestions: React.FC<AiReplySuggestionsProps> = ( {
    message,
    conversationHistory,
    onSelectSuggestion,
    onClose,
    visible
} ) => {
    const [suggestions, setSuggestions] = useState<string[]>( [] );
    const [loading, setLoading] = useState<boolean>( false );
    const [error, setError] = useState<string | null>( null );
    const scrollContainerRef = useRef<HTMLDivElement>( null );
    const apiCallInProgress = useRef<boolean>( false );
    const hasBeenVisible = useRef<boolean>( false ); // Fetch suggestions when component becomes visible
    useEffect( () => {
        // Only fetch suggestions when the component is visible and there's a message
        const fetchSuggestions = async () => {
            // Don't make duplicate calls if one is already in progress
            if ( apiCallInProgress.current ) return;

            // Don't refetch if we've already loaded suggestions
            if ( hasBeenVisible.current && suggestions.length > 0 ) return;

            if ( visible && message && !loading ) {
                try {
                    setLoading( true );
                    setError( null );
                    apiCallInProgress.current = true;
                    hasBeenVisible.current = true;                    // Call our dummy AI service to get suggestions
                    const response = await getAiReplySuggestions( message, conversationHistory );
                    console.log( 'Generated suggestions:', response.suggestions );

                    if ( response.suggestions && response.suggestions.length > 0 ) {
                        setSuggestions( response.suggestions );
                        setError( null );
                    } else {
                        // This should rarely happen as we have fallbacks
                        setSuggestions( ["Thanks!", "I see.", "Interesting!", "Tell me more.", "Got it."] );
                    }
                } catch ( err ) {
                    console.error( 'Error fetching AI suggestions:', err );
                    // Use fallback suggestions rather than showing an error
                    setSuggestions( ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"] );
                    setError( null ); // Don't show error UI since we have fallbacks
                } finally {
                    setLoading( false );
                    apiCallInProgress.current = false;
                }
            }
        };

        fetchSuggestions();
    }, [visible, message, conversationHistory, loading, suggestions.length] );

    // Add wheel event listener for horizontal scrolling without warnings
    useEffect( () => {
        const scrollContainer = scrollContainerRef.current;
        if ( !scrollContainer ) return;

        const handleWheel = ( e: WheelEvent ) => {
            // Only handle horizontal scroll if vertical scroll would happen
            if ( Math.abs( e.deltaY ) > Math.abs( e.deltaX ) ) {
                // Scroll horizontally by the vertical scroll amount
                scrollContainer.scrollLeft += e.deltaY;
            }
        };

        // Add the event listener to the scroll container
        scrollContainer.addEventListener( 'wheel', handleWheel );

        // Clean up the event listener when component unmounts
        return () => {
            scrollContainer.removeEventListener( 'wheel', handleWheel );
        };
    }, [visible] ); // Re-apply when visibility changes

    // Add support for keyboard navigation within the suggestions
    const handleKeyDown = ( e: React.KeyboardEvent, suggestion: string ) => {
        if ( e.key === 'Enter' || e.key === ' ' ) {
            e.preventDefault();
            onSelectSuggestion( suggestion );
        }
    }; if ( !visible ) return null;

    return (
        <div className="w-full py-1 px-2 mb-2 shadow-sm rounded-full bg-gradient-to-r from-rose-50 to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/80 backdrop-blur-sm relative">        {/* Development indicator - only visible in development mode */}

            <div className="absolute -top-5 left-2 text-xs px-2 py-0.5 rounded-md flex items-center">
                <span className="mr-1 flex items-center justify-center w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-700">
                    🤖
                </span>
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute -top-1 right-0 w-5 h-5 rounded-full bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 flex items-center justify-center z-10"
                aria-label="Close suggestions"
            >
                <span className="text-xs text-zinc-600 dark:text-zinc-300 pb-1">x</span>
            </button>
            <div
                ref={scrollContainerRef}
                className="py-1 flex gap-2 overflow-x-auto relative" style={{
                    WebkitOverflowScrolling: 'touch',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none', /* Firefox */
                    position: 'relative',
                    maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)'
                }}            >{loading ? (
                    <div className="flex items-center justify-center w-full py-2">
                        <div className="flex items-center">
                            <div className="animate-pulse flex space-x-2">
                                <div className="h-2 w-20 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                                <div className="h-2 w-16 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                                <div className="h-2 w-24 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
                            </div>
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center w-full py-2">
                        <span className="text-xs text-rose-500 dark:text-rose-400">
                            {error}
                        </span>
                    </div>
                ) : suggestions.length === 0 ? (
                    <div className="flex items-center justify-center w-full py-2">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            No suggestions available
                        </span>
                    </div>
                ) : (
                    suggestions.map( ( suggestion, index ) => (
                        <button
                            key={index}
                            onClick={() => onSelectSuggestion( suggestion )}
                            onKeyDown={( e ) => handleKeyDown( e, suggestion )}
                            tabIndex={0}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 dark:text-rose-200 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
                        >
                            {suggestion}
                        </button>
                    ) )
                )}
            </div>
        </div>
    );
};

export default AiReplySuggestions;
