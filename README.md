# NookChat

![NookChat Logo](./client/public/logo-md.png)

## Overview

NookChat is a secure and anonymous chat application enabling one-time, end-to-end encrypted conversations. With a focus on privacy, NookChat requires no login and leaves no traces, offering users a cozy digital nook for private communication.

![NookChat User Interface](./client/public/homeUI-image.png)

## ✨ Features

- **🔒 End-to-End Encryption**: All messages are encrypted using AES-256 via CryptoJS
- **👤 No Account Required**: Start chatting instantly without registration
- **⏳ Ephemeral Conversations**: Messages disappear after the chat session ends
- **📎 File Sharing**: Securely share images and files with supported formats
- **😊 Emoji Support**: Express yourself with a full emoji picker and skin tone selection
- **🌓 Dark/Light Mode**: Choose your preferred visual theme with system detection
- **🔔 Sound Notifications**: Customizable audio alerts with volume control
- **🤖 AI Reply Suggestions**: Smart response suggestions powered by Gemini AI
- **🧵 Reply Threading**: Reply to specific messages in conversations
- **⌨️ Real-Time Typing Indicators**: See when others are typing
- **📱 Mobile Responsive**: Works seamlessly across all devices with touch support
- **📊 Usage Analytics**: Integrated Google Analytics (gtag.js) with privacy-focused tracking

## Project Structure

The project is organized into two main directories:

- **client/**: Next.js frontend application
- **server/**: Express.js backend API and Socket.IO server

### Client Structure
```
client/
├── __mocks__/            # Jest mocks for file and style imports
├── __tests__/            # Test files organized by component/hook/util
├── pages/                # API routes including AI endpoints
│   └── api/
│       └── ai/           # AI API endpoints for suggestions and rewrites
├── public/               # Static assets including logos and sound files
│   └── sounds/           # Audio files for notifications
├── src/
│   ├── app/              # Next.js App Router structure
│   │   └── chat/         # Chat room routes with dynamic [chatCode]
│   ├── components/       # React components organized by feature
│   │   ├── appSettings/  # Application settings UI components
│   │   ├── chat/         # Chat interface components
│   │   ├── footer/       # Footer components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── features/         # Redux slices for state management
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API service layers
│   ├── store/            # Redux store configuration
│   ├── styles/           # Global styles and animations
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
```

### Server Structure
```
server/
├── middleware/           # Express middleware including rate limiting
├── routes/               # API route definitions
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/dharam-gfx/nookchat.git
cd nookchat
```

### Step 2: Install Server Dependencies

```bash
cd server
npm install
```

### Step 3: Install Client Dependencies

```bash
cd ../client
npm install
```

## Configuration

### Server Configuration

1. Create `.env` file in the server directory with:

```
# Server Environment Variables

SERVER_URL=http://localhost:5000  # Local development URL
# SERVER_URL=https://your-production-url.com  # Uncomment for production

```

### Client Configuration

The client is pre-configured to connect to the local server during development and a production server in production mode.

Create a `.env.local` file in the client directory with the following variables:

```
# Server URL - the base URL of your backend server
NEXT_PUBLIC_SERVER_URL=your_server_url

# API URL - optional external API URL if different from SERVER_URL
NEXT_PUBLIC_API_URL=your_api_url

# Encryption key for chat messages (32 bytes = 256 bits)
NEXT_PUBLIC_ENCRYPTION_KEY=your_encryption_key

# Google Gemini API key for AI features
GEMINI_API_KEY=your_gemini_api_key
```

For development, you can use `http://localhost:5000` as the `NEXT_PUBLIC_SERVER_URL`.

## Running the Application

### Development Mode

1. Start the server:

```bash
cd server
npm run dev
```

2. In a new terminal, start the client:

```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Production Mode

1. Build the client:

```bash
cd client
npm run build
```

2. Start the client:

```bash
npm start
```

3. Start the server:

```bash
cd ../server
npm start
```

## Analytics Integration

NookChat includes Google Analytics integration using Google Tag Manager (gtag.js) to collect anonymous usage statistics while respecting user privacy.

Key features of the analytics implementation:
- **Minimal Data Collection**: Only collects anonymous usage patterns
- **Privacy-First**: No personal data or chat content is tracked
- **Performance Optimized**: Scripts load only after the interface is interactive
- **GDPR Compliant**: Respects user privacy regulations
- **User-Centric Metrics**: Focuses on user experience metrics like session duration and feature usage

## Deployment

The application can be deployed to various platforms:

### Client Deployment

The Next.js client can be deployed to:
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Good alternative with simple configuration
- **GitHub Pages**: For static exports

### Server Deployment

The Express server can be deployed to:
- **Railway**: Used in production (as per next.config.ts rewrites)
- **Heroku**: Alternative with easy scalability
- **DigitalOcean**: For more control over the server environment

### Environment Variables

Set the following environment variables in your production deployment:
```
NODE_ENV=production
SERVER_URL=https://your-production-server-url
```

## Usage

1. **Create a Chat Room**: From the homepage, click "Start a New Chat"
2. **Share the Link**: Copy the unique chat room URL and share it with your conversation partner
3. **Chat Securely**: Enjoy end-to-end encrypted conversation
4. **File Sharing**: Use the attachment button to share images and files
5. **Customize Experience**: Toggle sound notifications and theme preferences

## Code Organization

### Key Components

- **ChatFeed**: Core component that displays messages in the chat interface
- **ChatInput**: Component for user message input with encryption
- **AiReplySuggestions**: AI-powered reply suggestion component
- **EmojiPickerContainer**: Emoji selection with skin tone support
- **ChatRoomHeader**: Room information and URL sharing functionality
- **FileUploadButton**: Component for uploading and sending files

### Application State

- **chatSlice**: Redux slice for chat state management
- **userSlice**: Redux slice for user preferences
- **soundSlice**: Redux slice for sound settings
- **ReplyContext**: React context for reply threading functionality

### Custom Hooks

- **useChatState**: Chat application state hook
- **useSocket**: Socket.io connection management
- **useNotificationSound**: Sound notification management
- **useCrypto**: Encryption/decryption utilities

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19
- **State Management**: Redux Toolkit with persistent storage
- **Real-Time Communication**: Socket.IO Client
- **Styling**: TailwindCSS 4 with custom animations
- **Component Library**: Radix UI primitives with shadcn/ui
- **Encryption**: CryptoJS for client-side AES-256 encryption
- **Testing**: Jest and React Testing Library
- **Emoji Support**: emoji-picker-react with skin tone selection
- **Toast Notifications**: Sonner for elegant notifications
- **Icons**: Lucide React for consistent iconography
- **Analytics**: Google Analytics with gtag.js integration

### Backend
- **Server**: Express.js 5
- **Real-Time Communication**: Socket.IO for bidirectional events
- **File Handling**: Multer for secure file uploads
- **ID Generation**: nanoid for URL-safe unique identifiers
- **Rate Limiting**: Express rate-limiter for API protection

## Security Features

- **End-to-End Encryption**: All messages encrypted using CryptoJS AES-256
- **Key Management**: Multiple encryption key fallback strategies
- **No Message Storage**: Messages never persist on the server
- **Ephemeral Chat Sessions**: Chat history disappears after sessions end
- **HTTP Security Headers**: Comprehensive headers including HSTS and CSP
- **Rate Limiting**: Protection against abuse through API rate limiting
- **No User Tracking**: No collection of personal data or chat content

## AI Features

NookChat integrates multiple AI-powered features to enhance the user experience:

### Reply Suggestions

NookChat offers intelligent reply suggestions powered by the Gemini AI API:

- **Context-Aware Responses**: The AI analyzes the received message to generate relevant reply suggestions
- **Quick Replies**: Users can select from suggested responses with a single click
- **Horizontal Scrollable Interface**: Browse through multiple suggestions in a clean, pill-based design
- **Keyboard Navigation**: Use Tab and Enter keys to select suggestions for accessibility
- **Fallback Suggestions**: Default suggestions provided even if the AI service is unavailable
- **Privacy-First Design**: Message context is processed temporarily and not stored permanently

#### How It Works

1. When a message is received, the AI suggestion component appears above the chat input
2. The component makes an API call to `/api/ai/suggestions` with the message content
3. The Gemini AI model generates contextually appropriate responses
4. Users can select a suggestion or dismiss the suggestions panel
5. The feature gracefully degrades if AI services are unavailable

### Text Rewriting

NookChat includes an AI-powered text rewriting feature:

- **Multiple Style Options**: Rewrite text to be formal, casual, friendly, or professional
- **Real-time Processing**: Quick rewriting using Google's Gemini AI API
- **Error Handling**: Returns original text if the AI service is unavailable
- **Seamless Integration**: Accessible directly from the chat interface

#### API Integration

The AI features are implemented through dedicated API endpoints:
- `/api/ai/suggestions` - Generates contextual reply suggestions
- `/api/ai/rewrite` - Rewrites text in different styles

#### Configuration

AI features can be:
- Enabled/disabled in user settings
- Customized for response style (formal, casual, professional)
- Adjusted for privacy preferences

## Testing

NookChat uses Jest and React Testing Library for comprehensive test coverage:

```bash
# Run client tests
cd client
npm test

# Run tests with watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

The test suite is organized into categories:

```
__tests__/
├── components/         # UI component tests
│   ├── Footer.test.tsx
│   ├── ModeToggle.test.tsx
│   └── ...
├── hooks/              # Custom React hooks tests
│   ├── useNotificationSound.test.ts
│   └── ...
└── utils/              # Utility functions tests
    ├── dateUtils.test.tsx
    └── ...
```

Mock implementations are provided for files and styles to ensure proper test isolation.

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Author

- **Dharmendra Kumar** - [dharam-gfx](https://github.com/dharam-gfx)

## Acknowledgments

- Icons from Lucide React
- UI components inspired by shadcn/ui and aceternity-UI