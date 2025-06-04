# Client Architecture

## Overview

This document outlines the client-side architecture of NookChat, explaining the structure, patterns, and key components that make up the frontend application.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **State Management**: Redux Toolkit + Context API
- **Styling**: Tailwind CSS + CSS Modules
- **UI Components**: Shadcn UI (customized)
- **Data Fetching**: SWR + Fetch API
- **Testing**: Jest + React Testing Library
- **Build Tools**: Turbopack

## Directory Structure

The client follows a feature-based organization with shared utilities and components:

```
client/src/
├── app/                        # Next.js App Router structure
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Landing page
│   └── chat/                   # Chat feature pages
│       ├── page.tsx            # Chat main page
│       └── [roomId]/           # Dynamic chat room routes
├── components/                 # UI components
│   ├── ui/                     # Base UI components (buttons, inputs, etc.)
│   └── feature/                # Feature-specific components
│       ├── chat/               # Chat feature components
│       └── settings/           # Settings feature components
├── contexts/                   # React Context providers
│   ├── ReplyContext.tsx        # Context for message replies
│   └── UploadedFilesContext.tsx # Context for file uploads
├── features/                   # Redux toolkit slices
│   ├── chatSlice.ts            # Chat state management
│   ├── userSlice.ts            # User state management
│   └── soundSlice.ts           # Sound settings state
├── hooks/                      # Custom React hooks
│   ├── useSocket.ts            # Socket.io connection management
│   └── useChatState.ts         # Chat state access
├── services/                   # API and external services
│   ├── imageServices/          # Image handling services
│   ├── sessionManager.ts       # Session management
│   └── roomService.ts          # Chat room API services
├── store/                      # Redux store configuration
│   └── store.ts                # Root store setup
├── types/                      # TypeScript type definitions
│   ├── chat.ts                 # Chat-related types
│   └── socket.ts               # Socket event types
└── utils/                      # Utility functions
    ├── dateUtils.ts            # Date formatting utilities
    └── encryptionUtils.ts      # Encryption utilities
```

## Architecture Patterns

### Component Architecture

NookChat follows a component-based architecture with emphasis on:

1. **Component Hierarchy**
   - Smart (container) components: Handle state and business logic
   - Presentation components: Render UI based on props
   - Layout components: Handle page structure

2. **Component Composition**
   - Higher-order components for cross-cutting concerns
   - Component composition over inheritance
   - Prop drilling minimized through context

3. **Component Lifecycle**
   - Server components for static/SEO content
   - Client components for interactive elements
   - Strategic use of suspense boundaries

### State Management

NookChat uses a hybrid state management approach:

1. **Global State (Redux)**
   - User information and preferences
   - Chat message history
   - Global app settings
   - Sound settings

2. **Local Component State (useState)**
   - Form state
   - UI toggles
   - Temporary component data

3. **Context API**
   - Theme context for dark/light mode
   - Reply context for message replies
   - Uploaded files context for file management
   - Features that require prop sharing across many components

### Data Flow

1. **User Input → State → UI Update**
   - User inputs (typing, clicking) update local state
   - State changes trigger UI re-renders
   - Side effects (API calls, socket events) are triggered

2. **Socket Events → State → UI Update**
   - Socket events are received by useSocket hook
   - Events dispatch actions to update Redux state
   - UI components receive new state and re-render

3. **API Requests → State → UI Update**
   - API requests are made by service functions
   - Responses update Redux state through actions
   - UI components reflect new state

## Key Systems

### Routing and Navigation

- Next.js App Router for file-based routing
- Dynamic routes for chat rooms (`/chat/[roomId]`)
- Route parameters for specific message views
- Layout components for consistent UI across routes

### Authentication and User Management

- Server-side authentication with JWT
- Client-side session management
- User preferences stored in local storage and synced with server
- User presence tracking via socket events

### Real-time Communication

- Socket.io client for real-time messaging
- Connection management with auto-reconnect
- Room joining and leaving logic
- Typing indicators and presence updates

### UI Components and Design System

- Shadcn UI as foundation
- Custom theme extension
- Responsive design principles
- Accessibility compliance
- Dark/light mode theming

### Error Handling and Resilience

- Error boundaries for component-level error isolation
- Retry mechanisms for failed API requests
- Offline detection and recovery
- Graceful degradation of features

## Performance Strategies

1. **Code Splitting**
   - Dynamic imports for large components
   - Route-based code splitting
   - Component lazy loading

2. **Asset Optimization**
   - Image optimization with Next.js Image
   - Font optimization with next/font
   - SVG optimization

3. **Rendering Optimization**
   - Memoization of expensive computations
   - Virtualized lists for chat messages
   - Debounced event handlers
   - Throttled API requests

4. **Network Optimization**
   - Data prefetching for common paths
   - Request caching with SWR
   - Optimized socket event batching

## Testing Strategy

1. **Unit Testing**
   - Component unit tests with React Testing Library
   - Utility function tests with Jest
   - Redux slice tests

2. **Integration Testing**
   - Feature flow tests
   - Multi-component integration
   - Redux store integration

3. **End-to-End Testing**
   - Critical user flows
   - Cross-browser compatibility

## Build and Deployment

- Next.js build optimizations
- Environment-specific configurations
- Build-time code analysis
- Production builds with sourcemaps

## Future Client Architecture Enhancements

1. **Performance**
   - Web workers for CPU-intensive tasks
   - Service worker for offline support
   - Progressive enhancement

2. **Architecture**
   - Micro-frontend architecture for scaling
   - Module federation for code sharing
   - Server components optimization

3. **Developer Experience**
   - Improved developer tooling
   - Component documentation
   - Interactive storybook
