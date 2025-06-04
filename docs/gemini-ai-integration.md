# Google Gemini AI Integration

## Overview

This document outlines the architecture and implementation for integrating Google Gemini AI into NookChat, enabling AI-powered features like smart replies, content generation, and conversation enhancement.

## Technology Stack

- **AI Provider**: Google Gemini API
- **Models Used**: 
  - Gemini-1.5-Flash: For efficient text generation and chat features
  - Gemini Pro: For general text generation and conversations
  - Gemini Pro Vision: For image understanding and multimodal interactions
- **Integration Method**: Google AI Node.js SDK (@google/genai)
- **Authentication**: Google Cloud API Keys

## Directory Structure

```
client/src/
├── components/
│   └── chat/
│       ├── AiSuggestions.tsx         # AI suggested replies component
│       └── AiAssistantButton.tsx     # Button to trigger AI assistant
├── services/
│   └── aiService.ts                  # Service for AI API communication
├── hooks/
│   └── useAiAssistant.ts             # Hook for AI functionality
└── utils/
    └── aiPromptUtils.ts              # Utilities for prompt engineering

server/
├── routes/
│   └── ai/
│       ├── gemini.js                 # Gemini API endpoints
│       └── prompts.js                # Predefined prompt templates
├── services/
│   └── aiService.js                  # Server-side AI processing
├── utils/
│   └── aiUtils/
│       ├── contextBuilder.js         # Chat context formatting
│       ├── promptTemplates.js        # System prompts for different features
│       └── responseParser.js         # Parse and format AI responses
└── config/
    └── aiConfig.js                   # Configuration for AI services
```

## Architecture Overview

The Gemini AI integration uses a hybrid approach:

1. **Server-side Processing**: Heavy AI operations occur on the server to:
   - Protect API keys
   - Reduce client-side processing
   - Enable content moderation
   - Cache common responses

2. **Client-side Integration**: The client provides:
   - UI components for AI interaction
   - Local state management for AI features
   - Real-time suggestions without full round trips

## Key Components

### Server-Side Implementation

#### 1. API Gateway

The server provides a secure gateway to the Gemini API:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// Get the model
const geminiProModel = genAI.getGenerativeModel({ model: "gemini-pro" });
const geminiProVisionModel = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

export { geminiProModel, geminiProVisionModel };
```

#### 2. Prompt Management

Structured prompt templates ensure consistent AI behavior:

```javascript
// Prompt templates for different AI features
export const promptTemplates = {
  smartReply: {
    systemPrompt: `You are a helpful assistant integrated into NookChat.
    Generate 3 short, natural-sounding reply options based on the conversation history.
    Replies should be brief (max 100 characters) and conversational.
    Format output as JSON array of strings: ["reply1", "reply2", "reply3"]`,
  },
  
  contentEnhancement: {
    systemPrompt: `You are a writing assistant in NookChat.
    Enhance the user's draft message with better grammar, clarity, and style while preserving their intent.
    Return only the enhanced text without explanations.`,
  },
  
  imageCaption: {
    systemPrompt: `You are a vision assistant in NookChat.
    Describe this image briefly but accurately in 1-2 sentences.
    Focus on the main subjects and context that would be relevant in a chat conversation.`,
  }
};
```

#### 3. Context Builder

Formats chat history for effective AI understanding:

```javascript
export function buildConversationContext(messages, currentUser, maxTokens = 2000) {
  // Format message history as context for the AI
  const formattedMessages = messages.map(msg => ({
    role: msg.userId === currentUser.id ? 'user' : 'other',
    content: decryptMessage(msg.encryptedData),
    timestamp: msg.timestamp
  }));
  
  // Truncate context if needed to meet token limits
  return truncateContext(formattedMessages, maxTokens);
}
```

### Client-Side Implementation

#### 1. AI Service

Handles communication with the server's AI endpoints:

```typescript
// aiService.ts
export const aiService = {
  // Get AI-suggested replies based on conversation context
  async getSuggestedReplies(conversationId: string, messageCount: number = 10): Promise<string[]> {
    try {
      const response = await fetch(`/api/ai/suggested-replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, messageCount })
      });
      
      const data = await response.json();
      return data.suggestions || [];
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      return [];
    }
  },
  
  // Enhance text with AI
  async enhanceText(text: string): Promise<string> {
    try {
      const response = await fetch(`/api/ai/enhance-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      return data.enhancedText || text;
    } catch (error) {
      console.error('Error enhancing text with AI:', error);
      return text;
    }
  },

  // Generate image caption
  async getImageCaption(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(`/api/ai/image-caption`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      });
      
      const data = await response.json();
      return data.caption || '';
    } catch (error) {
      console.error('Error generating image caption:', error);
      return '';
    }
  }
};
```

#### 2. AI Assistant Hook

Custom hook for AI functionality in components:

```typescript
// useAiAssistant.ts
import { useState, useCallback } from 'react';
import { aiService } from '@/services/aiService';
import useChatState from './useChatState';

export function useAiAssistant() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { messages, currentRoomId } = useChatState();
  
  // Get reply suggestions based on recent conversation
  const getSuggestedReplies = useCallback(async () => {
    if (!currentRoomId) return;
    
    setIsLoading(true);
    try {
      const suggestions = await aiService.getSuggestedReplies(currentRoomId, 10);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentRoomId, messages]);
  
  // Enhance drafted message text
  const enhanceMessage = useCallback(async (text: string) => {
    if (!text.trim()) return text;
    
    setIsLoading(true);
    try {
      const enhancedText = await aiService.enhanceText(text);
      return enhancedText;
    } catch (error) {
      console.error('Failed to enhance message:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  return {
    suggestions,
    isLoading,
    getSuggestedReplies,
    enhanceMessage,
  };
}
```

#### 3. AI Suggestions Component

Component to display AI-generated reply suggestions:

```tsx
// AiSuggestions.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAiAssistant } from '@/hooks/useAiAssistant';

interface AiSuggestionsProps {
  onSuggestionSelect: (suggestion: string) => void;
}

export function AiSuggestions({ onSuggestionSelect }: AiSuggestionsProps) {
  const { suggestions, isLoading, getSuggestedReplies } = useAiAssistant();
  
  // Request suggestions when the component mounts or is activated
  React.useEffect(() => {
    getSuggestedReplies();
  }, [getSuggestedReplies]);
  
  if (suggestions.length === 0 && !isLoading) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {isLoading ? (
        <div className="text-sm text-muted-foreground animate-pulse flex items-center">
          <Sparkles className="h-4 w-4 mr-1" />
          Thinking...
        </div>
      ) : (
        suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="text-sm py-1 px-2 h-auto"
            onClick={() => onSuggestionSelect(suggestion)}
          >
            {suggestion}
          </Button>
        ))
      )}
    </div>
  );
}
```

## AI Features Implementation

### 1. Smart Reply Suggestions

Provides contextually relevant reply suggestions:

```tsx
// Inside ChatControls.tsx
const { suggestions, getSuggestedReplies } = useAiAssistant();

// Trigger suggestions when the user receives a new message
useEffect(() => {
  if (lastReceivedMessage && !isTyping) {
    getSuggestedReplies();
  }
}, [lastReceivedMessage, isTyping, getSuggestedReplies]);

// In the render function
<div className="relative w-full">
  {suggestions.length > 0 && (
    <AiSuggestions 
      onSuggestionSelect={(text) => {
        setMessage(text);
        // Optional: Auto-send if enabled in settings
        if (settings.autoSendAiSuggestions) {
          sendMessage(text);
        }
      }}
    />
  )}
  <textarea
    value={message}
    onChange={handleMessageChange}
    /* other props */
  />
</div>
```

The client-side service that handles AI suggestion requests:

```typescript
// src/services/aiService.ts
export async function getAiReplySuggestions(
  message: string,
  // Keep the conversationHistory parameter for API compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  conversationHistory?: Array<{ role: 'user' | 'assistant' | 'system', content: string }>
): Promise<AiSuggestionResponse> {
  try {
    console.log('Generating reply suggestions using Gemini AI for message:', message);

    const response = await fetch('/api/ai/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI suggestions');
    }

    const data = await response.json();
    return {
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [data.text]
    };
  } catch (error) {
    console.error('Error generating reply suggestions:', error);
    // Return default suggestions on error
    return {
      suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
    };
  }
}
```

### 2. Message Enhancement

AI-powered grammar and style improvements:

```tsx
// Inside ChatControls.tsx
const { enhanceMessage } = useAiAssistant();

const handleEnhance = async () => {
  if (!message.trim()) return;
  
  setIsEnhancing(true);
  try {
    const enhanced = await enhanceMessage(message);
    setMessage(enhanced);
  } finally {
    setIsEnhancing(false);
  }
};

// In the render function
<Button
  variant="ghost"
  size="icon"
  onClick={handleEnhance}
  disabled={isEnhancing || !message.trim()}
  title="Enhance with AI"
>
  <Sparkles className={cn("h-4 w-4", isEnhancing && "animate-pulse")} />
</Button>
```

The client-side service that handles AI text rewriting:

```typescript
// src/services/aiService.ts
export async function getAiRewrittenText(
  text: string,
  style?: 'formal' | 'casual' | 'friendly' | 'professional'
): Promise<AiRewriteResponse> {
  try {
    console.log('Rewriting text using Gemini AI:', text, 'style:', style || 'default');

    const response = await fetch('/api/ai/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, style }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI rewritten text');
    }

    const data = await response.json();
    return { rewrittenText: data.rewrittenText || text };
  } catch (error) {
    console.error('Error rewriting text with AI:', error);
    // Return the original text on error
    return { rewrittenText: text };
  }
}
```

### 3. Image Understanding

AI-powered image captioning for uploads:

```tsx
// Inside UploadedImagesPreview.tsx
const { getImageCaption } = aiService;

const handleGenerateCaption = async (imageUrl: string) => {
  setCaptioning(true);
  try {
    const caption = await getImageCaption(imageUrl);
    if (caption) {
      setMessage(prev => prev ? `${prev} ${caption}` : caption);
    }
  } finally {
    setCaptioning(false);
  }
};

// In the render function
<Button
  variant="ghost"
  size="sm"
  onClick={() => handleGenerateCaption(image.previewUrl)}
  disabled={captioning}
>
  <FileText className="h-3 w-3 mr-1" />
  {captioning ? 'Generating...' : 'Generate Caption'}
</Button>
```

## API Endpoints

### 1. Smart Replies

```typescript
// client/pages/api/ai/suggestions.ts
export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    //conversationHistory we not use it, for now we use in feature.
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

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

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let suggestionsText = '';
    for await (const chunk of response) {
      suggestionsText += chunk.text;
    }

    // Remove code block markers and parse JSON array from suggestionsText
    const cleanedText = suggestionsText
      .replace(/```json\n?/, '')
      .replace(/```/, '')
      .trim();

    let suggestions: string[] = [];
    try {
      suggestions = JSON.parse(cleanedText);
      if (!Array.isArray(suggestions)) {
        suggestions = [];
      }
    } catch {
      suggestions = [];
    }

    if (suggestions.length === 0) {
      return res.status(200).json({
        suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
      });
    }

    return res.status(200).json({ suggestions });
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return res.status(200).json({
      suggestions: ["Thanks!", "I understand.", "Tell me more.", "Got it!", "Interesting!"]
    });
  }
}
```

## API Endpoints (continued)

### 2. Text Rewriting

```typescript
// client/pages/api/ai/rewrite.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, style = 'default' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = buildPrompt(text, style);

    const response = await ai.models.generateContentStream({
      model: 'gemini-1.5-flash',
      config: {
        responseMimeType: 'text/plain',
        temperature: 0.3,
        maxOutputTokens: 300,
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    let rewrittenText = '';
    for await (const chunk of response) {
      rewrittenText += chunk.text;
    }

    rewrittenText = rewrittenText.replace(/^["']|["']$/g, '').trim();

    return res.status(200).json({ rewrittenText });
  } catch (error) {
    console.error('Rewrite error:', error);
    return res.status(500).json({ error: 'Failed to rewrite text' });
  }
}

// Style prompts for different rewriting styles
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
```

## Security and Privacy Considerations

### 1. Data Privacy

- Chat content is sent to Google Gemini API only with user consent
- Personal identifying information is stripped from prompts
- API keys are stored securely server-side only
- Users can opt out of AI features entirely
- Temporary storage only - no permanent retention of user messages

### 2. Content Moderation

- Server-side filtering of inappropriate content
- Rate limiting to prevent abuse
- Content safety settings in the Gemini API configuration:
  ```typescript
  const config = {
    responseMimeType: 'text/plain',
    temperature: 0.3,
    maxOutputTokens: 200,
    // Safety settings to prevent harmful or inappropriate content
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE",
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE", 
      }
    ]
  };
  ```

### 3. Rate Limiting

- Tiered rate limits based on user roles
- Cooldown periods for AI-intensive features
- Usage tracking to prevent API quota exhaustion
- Automatic fallback to default content when rate limited

## Future Enhancements

### 1. Advanced Contextual Understanding

- **Conversation History Analysis**: Enhance AI responses by analyzing longer conversation history
- **User Preference Learning**: Remember individual user communication styles and preferences
- **Topic Detection**: Automatically identify conversation topics for more targeted suggestions

### 2. Multimodal Features

- **Image Analysis**: Add image description and content analysis for shared images
- **Voice Message Transcription**: Convert voice messages to text for AI processing
- **Rich Media Understanding**: Process links, videos, and other media types in conversations

### 3. User Experience Improvements

- **Suggestion Quality Feedback**: Allow users to rate AI suggestions to improve relevance
- **Customizable AI Persona**: Let users adjust the tone and style of AI responses
- **Predictive Message Completion**: Add typing assistance with predictive text as users compose messages

### 4. Technical Improvements

- **Caching Frequently Used Responses**: Implement server-side caching for common queries
- **Streaming API Integration**: Use streaming for faster partial responses during generation
- **Context Window Optimization**: Better algorithms for selecting relevant context from long chats
- **Fine-tuned Models**: Potentially train or fine-tune models specifically for chat scenarios

## Environment Setup

### Configuration Requirements

To use the Gemini AI features in NookChat, the following environment variables need to be configured:

```env
# Client .env.local file
GEMINI_API_KEY=your_gemini_api_key
```

### Installation Dependencies

The Gemini AI integration requires the Google Generative AI Node.js SDK:

```bash
# For client-side integration (Next.js)
npm install @google/generative-ai
```

## Error Handling and Resilience

The Gemini AI implementation includes several strategies to ensure graceful degradation:

1. **Fallback Content**: Default replies and content are provided when AI services fail
2. **Error Logging**: Comprehensive error logging for monitoring and debugging
3. **Timeout Handling**: Requests timeout after a reasonable period to prevent UI blocking
4. **Rate Limit Detection**: Automatic detection and handling of rate-limiting scenarios
5. **Client-side Recovery**: UI components are designed to function without AI features when unavailable

## Performance Optimization

### 1. Caching Strategy

- Common AI responses are cached to reduce API calls
- User-specific suggestion caching with time-to-live (TTL)
- Potential Redis-based distributed caching for server scalability

### 2. Request Optimization

- Batched API requests where possible
- Smart throttling of AI features during high load
- Progressive loading UI patterns for asynchronous AI operations

## Configuration Options

Users can customize their AI experience:

```typescript
// User AI settings
interface AiSettings {
  enabled: boolean;              // Master toggle for AI features
  suggestReplies: boolean;       // Show smart reply suggestions
  enhanceMessages: boolean;      // Allow message enhancement
  autoSendSuggestions: boolean;  // Auto-send when suggestion clicked
  imageCaption: boolean;         // Generate image captions
  feedbackMode: 'explicit' | 'implicit' | 'none'; // How to collect AI feedback
}
```

## Future Enhancements

### 1. Advanced AI Features

- Message summarization for long conversations
- Topic detection and tagging
- Sentiment analysis for emotional intelligence
- Language translation integration

### 2. Personalization

- Learning from user behavior to improve suggestions
- Personal writing style matching
- Custom prompt templates per user preference

### 3. Multimodal Capabilities

- Voice message transcription
- Image understanding and content extraction
- Document parsing and summarization

## Testing and Quality Assurance

### Unit Testing

AI services have proper unit tests with mocked responses:

```typescript
// Example test for aiService
describe('AIService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    // Mock fetch API
    global.fetch = jest.fn();
  });

  describe('getAiReplySuggestions', () => {
    it('should return suggestions when API call is successful', async () => {
      // Mock successful response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: ['Great!', 'Tell me more'] }),
      });

      const result = await getAiReplySuggestions('Hello there');
      
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions).toContain('Great!');
    });

    it('should return fallback suggestions on API failure', async () => {
      // Mock failed response
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getAiReplySuggestions('Hello there');
      
      // Should return default suggestions
      expect(result.suggestions).toHaveLength(5);
      expect(result.suggestions).toContain('Thanks!');
    });
  });
});
```

### Integration Testing

Testing AI components with users to ensure a natural experience:

- A/B testing for suggestion relevance
- User satisfaction metrics for AI-enhanced content
- Performance benchmarking for response times

## Monitoring and Analytics

### Key Metrics

- **API Usage**: Track Gemini API calls and quota consumption
- **Response Quality**: Monitor suggestion acceptance rates
- **Performance**: Track response times and success rates
- **User Engagement**: Measure impact of AI features on user retention

### Logging Strategy

Structured logging for AI operations helps with debugging and optimization:

```typescript
// Example logging for AI operations
const logAiOperation = (operation, data) => {
  logger.info('AI Operation', {
    operation,
    userId: data.userId,
    timestamp: new Date().toISOString(),
    successful: data.successful,
    duration: data.duration,
    model: data.model,
    // Don't log sensitive content
    contentLength: data.content?.length
  });
};
```

## Conclusion

### Implementation Benefits

The Google Gemini AI integration in NookChat provides:

1. **Enhanced User Experience**: Smart features make conversations more engaging and productive
2. **Reduced Friction**: AI assistance helps users communicate more effectively
3. **Modern Capabilities**: State-of-the-art AI features differentiate the application
4. **Scalable Architecture**: Implementation designed to grow with both user base and AI capabilities

### Best Practices Implemented

The integration follows several best practices:

- **Graceful Degradation**: Application remains fully functional even if AI features are unavailable
- **User Control**: All AI features can be configured or disabled by users
- **Privacy First**: Minimal data collection and processing with transparent controls
- **Performance Optimization**: Careful implementation to ensure AI features don't slow down the app
- **Continuous Improvement**: Architecture designed to easily incorporate new AI capabilities

### Resources

- [Google Generative AI Documentation](https://ai.google.dev/docs)
- [Gemini API Reference](https://ai.google.dev/api/rest/v1/models)
- [Google AI JavaScript SDK](https://www.npmjs.com/package/@google/generative-ai)
- [Prompt Engineering Best Practices](https://ai.google.dev/docs/prompt_engineering)
