import { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

interface ApiResponse {
    rewrittenText?: string;
    error?: string;
}

const stylePrompts: Record<string, string> = {
    formal: 'Rewrite the following text in a formal, professional tone.',
    casual: 'Rewrite the following text in a casual, conversational tone.',
    friendly: 'Rewrite the following text in a friendly and warm tone.',
    professional: 'Rewrite the following text in a professional business tone.',
    default: 'Improve the clarity and engagement of the following text.',
};

const buildPrompt = (text: string, style: string) => `
You are an AI assistant that rewrites text to improve its clarity, tone, and readability.
${stylePrompts[style] || stylePrompts.default}
Do not alter the original meaning or add new information.

Text:
"${text}"

IMPORTANT: Respond ONLY with the rewritten text. No introductions, explanations, or formatting.
Use the SAME LANGUAGE as the original text. Do not translate.
`;

export default async function handler( req: NextApiRequest, res: NextApiResponse<ApiResponse> ) {
    if ( req.method !== 'POST' ) {
        return res.status( 405 ).json( { error: 'Method not allowed' } );
    }

    try {
        const { text, style = 'default' } = req.body;

        if ( !text || typeof text !== 'string' ) {
            return res.status( 400 ).json( { error: 'Text is required and must be a string' } );
        }

        if ( !process.env.GEMINI_API_KEY ) {
            throw new Error( 'GEMINI_API_KEY is not defined' );
        }

        const ai = new GoogleGenAI( { apiKey: process.env.GEMINI_API_KEY } );

        const prompt = buildPrompt( text, style );

        const response = await ai.models.generateContentStream( {
            model: 'gemini-1.5-flash',
            config: {
                responseMimeType: 'text/plain',
                temperature: 0.3,
                maxOutputTokens: 300,
            },
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        } );

        let rewrittenText = '';
        for await ( const chunk of response ) {
            rewrittenText += chunk.text;
        }

        rewrittenText = rewrittenText.replace( /^["']|["']$/g, '' ).trim();

        return res.status( 200 ).json( { rewrittenText } );

    } catch ( error ) {
        console.error( 'Rewrite error:', error );
        return res.status( 500 ).json( { error: 'Failed to rewrite text' } );
    }
}
