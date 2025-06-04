# Server Architecture

## Overview

This document outlines the server-side architecture of NookChat, explaining the structure, patterns, and key components that make up the backend application.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSockets**: Socket.IO
- **Language**: JavaScript (ESM modules)
- **Authentication**: JWT-based authentication
- **File Storage**: Local filesystem (with cloud storage options)
- **Rate Limiting**: Express rate limiter middleware
- **CORS**: Custom CORS configuration

## Directory Structure

The server follows a modular organization with clear separation of concerns:

```
server/
├── index.js                    # Main server entry point
├── cors-config.js              # CORS configuration
├── package.json                # Dependencies and scripts
├── middleware/                 # Express middleware
│   ├── auth.js                 # Authentication middleware
│   ├── errorHandler.js         # Global error handling
│   └── rateLimiter.js          # Request rate limiting
├── routes/                     # API route handlers
│   ├── api.js                  # Main API routes
│   └── images.js               # Image handling routes
├── controllers/                # Route controllers
│   ├── userController.js       # User-related operations
│   └── roomController.js       # Room management operations
├── services/                   # Business logic services
│   ├── authService.js          # Authentication services
│   └── messageService.js       # Message handling services
└── utils/                      # Utility modules
    ├── validation.js           # Input validation utilities
    ├── logger.js               # Logging utilities
    └── imageUtils/             # Image handling utilities
        ├── constants.js        # Image-related constants
        ├── dirManager.js       # Directory management
        ├── fileManager.js      # File operations
        ├── cleanup.js          # Image cleanup utilities
        └── index.js            # Central export point
```

## Architecture Patterns

### Request Processing Flow

1. **Request Entry**
   - Express receives incoming HTTP request
   - CORS and basic middleware applied
   - Request logging and tracking

2. **Middleware Processing**
   - Authentication verification (if required)
   - Rate limiting check
   - Request validation

3. **Route Handling**
   - Request routed to appropriate controller
   - Controller performs business logic
   - Services are called for data operations

4. **Response Generation**
   - Response formatted according to API standards
   - Error handling applied if needed
   - Response sent to client

### WebSocket Communication

1. **Connection Management**
   - Socket.IO handles client connections
   - Authentication/authorization on connection
   - Connection tracking and room management

2. **Event Processing**
   - Client events are received
   - Event handlers process the messages
   - Business logic is applied
   - State is updated

3. **Broadcasting**
   - Events are broadcast to appropriate recipients
   - Room-based broadcasting for chat messages
   - Targeted events for specific users

### Error Handling

1. **Layered Approach**
   - Low-level try/catch blocks in utility functions
   - Service-level error handling and wrapping
   - Global error handling middleware
   - Unhandled rejection and exception catching

2. **Error Responses**
   - Standardized error response format
   - Appropriate HTTP status codes
   - Detail level based on environment (dev/prod)
   - Error logging for monitoring

## Key Systems

### Socket.IO Integration

The server uses Socket.IO for real-time bidirectional communication:

```javascript
const io = new Server(server, {
  cors: socketCorsConfig,
  maxHttpBufferSize: 5e6, // 5MB max payload
  pingTimeout: 30000,
  connectTimeout: 10000,
  reconnection: true,
});

io.on('connection', (socket) => {
  console.log('Connected:', socket.id);

  // Setup event handlers
  socket.on('join-room', handleJoinRoom);
  socket.on('send-message', handleSendMessage);
  socket.on('user-typing', handleUserTyping);
  
  // Handle disconnection
  socket.on('disconnect', handleDisconnect);
});
```

### In-Memory Data Management

The server maintains in-memory data structures for active sessions:

```javascript
// In-memory chat room storage
const chatRooms = {};
const typingUsers = {};

// Room structure
chatRooms[roomId] = {
  messages: [], // Array of message objects
  users: new Set(), // Set of connected users
};

// Typing indicator structure
typingUsers[roomId] = new Set(); // Set of currently typing users
```

### File Upload and Management

The server handles file uploads through a structured approach:

1. **Upload Configuration**
   - Multer middleware for multipart form handling
   - File type validation and filtering
   - Storage configuration

2. **Storage Organization**
   - Session-based directory structure
   - Unique filename generation
   - Path and URL management

3. **Cleanup Processes**
   - Scheduled cleanup for inactive sessions
   - On-demand cleanup when sessions end
   - Error handling for file operations

## Security Architecture

### Authentication & Authorization

- JWT-based authentication for API routes
- Socket authentication via initial handshake
- Role-based access control for admin functions
- Session validation for persistent connections

### Input Validation & Sanitization

- Request validation middleware
- Data sanitization for user inputs
- Content security policies
- Protection against common web vulnerabilities

### Rate Limiting & DoS Protection

- Global rate limiting for all API requests
- Endpoint-specific rate limits for sensitive operations
- Socket event throttling
- IP-based blocking for abuse detection

## Performance Considerations

### Scalability

The server architecture is designed with scalability in mind:

1. **Horizontal Scaling**
   - Stateless design (except for in-memory storage)
   - Ready for load balancer integration
   - Potential for Redis-based state sharing

2. **Resource Optimization**
   - Efficient socket event handling
   - Stream processing for file uploads
   - Memory usage monitoring

3. **Caching Strategies**
   - Response caching where appropriate
   - Optimized database queries
   - In-memory caching for frequent data

### Monitoring and Logging

- Structured logging with log levels
- Performance metrics collection
- Error tracking and alerting
- Health check endpoints

## Deployment Architecture

- Docker containerization support
- Environment-based configuration
- Process management with PM2
- Ready for CI/CD integration

## Future Server Architecture Enhancements

1. **Database Integration**
   - MongoDB/PostgreSQL for persistent storage
   - Message history archiving
   - User profile storage

2. **Scaling Infrastructure**
   - Redis for shared socket state
   - Queue system for background processing
   - Microservice architecture

3. **Advanced Features**
   - WebRTC signaling for voice/video
   - Push notification service
   - Analytics engine integration
   - AI-powered message analysis
