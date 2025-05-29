import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface ApiResponse {
    suggestions?: string[];
    error?: string;
    text?: string;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if ( req.method !== 'POST' ) {
        return res.status( 405 ).json( { error: 'Method not allowed' } );
    }

    try {

        //conversationHistory we not use it, for now we use in feature.
        const { message } = req.body;

        if ( !message || typeof message !== 'string' ) {
            return res.status( 400 ).json( { error: 'Message is required and must be a string' } );
        }

        if ( !process.env.GEMINI_API_KEY ) {
            throw new Error( 'GEMINI_API_KEY is not defined in environment variables' );
        }

        const ai = new GoogleGenAI( {
            apiKey: process.env.GEMINI_API_KEY,
        } );

        const prompt = `You are an AI assistant that generates reply suggestions based on the user's message and conversation history. Provide 5 concise, relevant, and engaging reply suggestions.
Your task is to generate suggestions that are short, friendly, and suitable for a casual conversation. give in array format.
Here is the user's message: "${message}"`;

        const config = {
            responseMimeType: 'text/plain',
            temperature: 0.3,
            maxOutputTokens: 200,
        };

        const model = 'gemini-1.5-flash';
        const contents = [{
            role: 'user',
            parts: [{ text: prompt }],
        }];

        const response = await ai.models.generateContentStream( {
            model,
            config,
            contents,
        } );

        let suggestionsText = '';
        for await ( const chunk of response ) {
            suggestionsText += chunk.text;
        }

        // Remove code block markers and parse JSON array from suggestionsText
        const cleanedText = suggestionsText
            .replace( /```json\n?/, '' )
            .replace( /```/, '' )
            .trim();

        let suggestions: string[] = [];
        try {
            suggestions = JSON.parse( cleanedText );
            if ( !Array.isArray( suggestions ) ) {
                suggestions = [];
            }
        } catch {
            suggestions = [];
        }

        if ( suggestions.length === 0 ) {
            return res.status( 200 ).json( {
                suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
            } );
        }

        return res.status( 200 ).json( { suggestions } );

    } catch ( error ) {
        console.error( 'Error generating suggestions:', error );
        return res.status( 200 ).json( {
            suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
        } );
    }
}
