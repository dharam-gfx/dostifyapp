/**
 * Response from the AI suggestions API
 */
export interface AiSuggestionResponse {
    /** Array of text suggestions to display to the user */
    suggestions: string[];
}

/**
 * Response from the AI rewrite API
 */
export interface AiRewriteResponse {
    /** Rewritten text */
    rewrittenText: string;
}

/**
 * Returns AI-generated reply suggestions based on the message content using Gemini AI
 */
export async function getAiReplySuggestions(
    message: string,
    // Keep the conversationHistory parameter for API compatibility
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system', content: string }>
): Promise<AiSuggestionResponse> {
    try {
        console.log( 'Generating reply suggestions using Gemini AI for message:', message );

        const response = await fetch( '/api/ai/suggestions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {
                message,
                // conversationHistory // We are not using conversation history in this dummy implementation
                // but keeping it for future compatibility
            } ),
        } );

        if ( !response.ok ) {
            throw new Error( 'Failed to get AI suggestions' );
        }

        const data = await response.json();
        return {
            suggestions: Array.isArray( data.suggestions ) ? data.suggestions : [data.text]
        };
    } catch ( error ) {
        console.error( 'Error generating reply suggestions:', error );

        // Return default suggestions on error
        return {
            suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
        };
    }
}

/**
 * Returns AI-rewritten text based on the input text using Gemini AI
 */
export async function getAiRewrittenText(
    text: string,
    style?: 'formal' | 'casual' | 'friendly' | 'professional'
): Promise<AiRewriteResponse> {
    try {
        console.log( 'Rewriting text using Gemini AI:', text, 'style:', style || 'default' );

        const response = await fetch( '/api/ai/rewrite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {
                text,
                style
            } ),
        } );

        if ( !response.ok ) {
            throw new Error( 'Failed to get AI rewritten text' );
        }

        const data = await response.json();
        return {
            rewrittenText: data.rewrittenText || text
        };
    } catch ( error ) {
        console.error( 'Error rewriting text with AI:', error );

        // Return the original text on error
        return {
            rewrittenText: text
        };
    }
}