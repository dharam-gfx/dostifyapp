# Message System Architecture

## Overview

This document explains the architecture of the messaging system in NookChat, including how messages are created, transmitted, stored, and displayed.

## Directory Structure

### Server-Side Organization

```
server/
├── index.js                    # Socket.io server setup and message handling
├── routes/
│   └── api.js                  # REST API endpoints for messages
└── utils/
    └── messageUtils/           # Message handling utilities
        ├── validation.js       # Message validation functions
        ├── storage.js          # Message storage functions
        └── formatting.js       # Message formatting utilities
```

### Client-Side Organization

```
client/src/
├── components/
│   └── chat/
│       ├── ActionButtons.tsx        # Message action buttons
│       ├── ChatControls.tsx         # Main chat input controls
│       ├── IncomingMessage.tsx      # Component for displaying received messages
│       ├── OutgoingMessage.tsx      # Component for displaying sent messages
│       ├── MessageAttachments.tsx   # Component for message attachments
│       └── ReplyPreview.tsx         # Component for displaying message replies
├── contexts/
│   └── ReplyContext.tsx             # Context for managing message replies
├── features/
│   └── chatSlice.ts                 # Redux slice for chat state management
├── hooks/
│   └── useSocket.ts                 # Socket connection and message handling
├── services/
│   ├── sessionManager.ts            # Session management for chat rooms
│   └── roomService.ts               # Service for managing chat rooms
├── types/
│   ├── chat.ts                      # Type definitions for chat messages
│   └── socket.ts                    # Type definitions for socket events
└── utils/
    ├── encryptionUtils.ts           # Utilities for message encryption
    ├── dateUtils.ts                 # Date formatting for messages
    └── messageUtils.ts              # Message utility functions
```

## Key Components

### Server-Side

1. **Socket.io Server (index.js)**
   - Handles real-time message exchange
   - Manages chat rooms and user sessions
   - Processes message events (send, typing, etc.)

2. **Message Storage**
   - In-memory storage for active chat sessions
   - Message history management
   - Room-based message organization

3. **API Endpoints**
   - Room creation and management
   - Message history retrieval
   - User presence management

### Client-Side

1. **Socket Connection (useSocket.ts)**
   - Establishes and maintains socket connection
   - Handles socket events (connect, disconnect, errors)
   - Emits and receives message events

2. **Message Components**
   - `IncomingMessage.tsx`: Displays messages from other users
   - `OutgoingMessage.tsx`: Displays messages sent by the current user
   - `MessageAttachments.tsx`: Handles displaying message attachments
   - `ReplyPreview.tsx`: Shows preview when replying to messages

3. **Chat Controls**
   - Message input and sending
   - File and image uploads
   - Reply functionality
   - Emoji picker

4. **State Management**
   - Redux store for messages and chat state
   - Context providers for specialized state (replies, typing)
   - Socket event handling and state updates

5. **Security Features**
   - End-to-end encryption for messages
   - Session-based authentication
   - Secure image handling

## Message Flow

### Sending a Message

1. User types a message in `ChatControls` component
2. Message content is processed (formatting, attachments)
3. If attachments exist, they are uploaded via `imageUploadService`
4. Message is encrypted using `encryptionUtils`
5. Socket emits 'send-message' event with encrypted data
6. Server receives message and broadcasts to other users in the room
7. Message is stored in server's in-memory storage

### Receiving a Message

1. Server broadcasts message to all users in the room
2. Client receives 'receive-message' event via socket
3. Message is decrypted using `encryptionUtils`
4. Redux state is updated with the new message
5. UI renders new message in the chat view
6. Notification sound plays if enabled

### Message Features

1. **Text Formatting**
   - Basic markdown support
   - Emoji rendering and conversion
   - Link detection and preview

2. **Emoji System**
   - Emoji picker integration
   - Unicode emoji support
   - Custom emoji sets
   - Emoji shortcodes (e.g., `:smile:`)
   - Emoji reactions to messages

3. **Attachments**
   - Image attachments
   - Multiple file support
   - Preview and full-view modes

3. **Replies**
   - Reply to specific messages
   - Visual threading of conversations
   - Context preservation

4. **Typing Indicators**
   - Real-time typing status
   - User activity tracking
   - Presence management

## Usage Examples

### Server-Side

```javascript
// Handling a new message
socket.on('send-message', ({ encryptedData, userId, messageId, replyTo }) => {
  console.log(`Message from ${userId} in room ${roomId}`);

  // Save message
  chatRooms[roomId].messages.push({
    encryptedData,
    userId,
    messageId,
    replyTo,
    timestamp: Date.now()
  });

  // Broadcast to others
  socket.to(roomId).emit('receive-message', {
    encryptedData,
    userId,
    messageId,
    replyTo
  });
});
```

### Client-Side

```typescript
// Sending a message
const sendMessage = async (text: string) => {
  if (!text.trim() && uploadedFiles.length === 0) return;
  
  try {
    // Upload any attached images
    const imageUrls = await uploadImages(uploadedFiles);
    
    // Create a combined message with text and image links
    const fullMessage = attachImagesToMessage(text, imageUrls);
    
    // Encrypt the message content
    const encryptedData = encryptMessage(fullMessage);
    
    // Generate a unique ID for this message
    const messageId = generateUniqueId();
    
    // Emit the message via socket
    socket.emit('send-message', {
      encryptedData,
      userId: currentUser.id,
      messageId,
      replyTo: replyingTo // null if not replying
    });
    
    // Clear the input and attachments
    clearFiles();
    setReplyingTo(null);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
};
```

## Security Considerations

1. **End-to-End Encryption**
   - All message content is encrypted client-side
   - Server only sees encrypted data
   - Messages are decrypted only on recipient clients

2. **Session Management**
   - Secure room access control
   - User authentication for chat access
   - Ephemeral session keys

3. **Data Handling**
   - Temporary storage of chat history
   - Automatic cleanup of inactive sessions
   - Secure attachment handling

## Future Enhancements

1. **Persistent Storage**
   - Database integration for message history
   - Message search functionality
   - Chat history retrieval

2. **Advanced Features**
   - Message editing and deletion
   - Read receipts
   - Message reactions
   - Voice and video messaging

3. **Performance Optimizations**
   - Message pagination
   - Lazy loading for media
   - Optimized socket connection handling
