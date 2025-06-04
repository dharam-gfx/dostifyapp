# Emoji System Architecture

## Overview

This document explains the emoji system architecture in NookChat, including how emojis are integrated, processed, and displayed in the application.

## Directory Structure

```
client/src/
├── components/
│   ├── chat/
│   │   ├── EmojiPicker.tsx           # Emoji picker component
│   │   └── MessageWithEmoji.tsx      # Message rendering with emoji support
│   └── ui/
│       └── EmojiButton.tsx           # UI button for emoji selection
├── services/
│   └── emojiServices/
│       ├── emojiData.ts              # Emoji dataset
│       ├── emojiParser.ts            # Emoji parsing and conversion
│       └── emojiRenderer.ts          # Rendering emojis in messages
├── hooks/
│   └── useEmojiPicker.ts             # Hook for emoji picker functionality
└── utils/
    └── emojiUtils.ts                 # Utility functions for emoji handling
```

## Key Components

### Emoji Data Management

1. **Emoji Dataset**
   - Unicode emoji definitions
   - Emoji categories and groups
   - Shortcode mappings (`:smile:` → 😊)
   - Custom emoji definitions

2. **Emoji Parser**
   - Converts shortcodes to Unicode emojis
   - Identifies emojis in text content
   - Handles emoji sequences and variants

### User Interface

1. **Emoji Picker Component**
   - Category-based navigation
   - Search functionality
   - Recently used emojis
   - Skin tone selector
   - Custom emoji support

2. **Message Rendering**
   - Unicode emoji rendering
   - Custom emoji image rendering
   - Emoji size and alignment handling
   - Support for emoji sequences

3. **Emoji Reactions**
   - Adding reactions to messages
   - Displaying reaction counts
   - Grouping identical reactions
   - Adding/removing reactions

## Technical Implementation

### Emoji Data Structure

```typescript
interface EmojiData {
  id: string;           // Unique identifier
  native: string;       // Unicode representation
  shortcodes: string[]; // Array of shortcodes
  category: string;     // Category (e.g., "faces", "animals")
  keywords: string[];   // Search keywords
}

interface CustomEmoji extends EmojiData {
  url: string;          // URL to emoji image
  animated: boolean;    // Whether the emoji is animated
}
```

### Emoji Parsing Process

1. **Input Processing**
   - Message text is scanned for shortcodes and Unicode emojis
   - Shortcodes are matched against the emoji database
   - Unicode emojis are identified and normalized
   - Custom emoji references are processed

2. **Rendering Enhancement**
   - Unicode emojis are wrapped in appropriate styling components
   - Custom emojis are replaced with image elements
   - Emoji sequences are properly grouped for display

### Emoji Selection Flow

1. User clicks on the emoji button in ChatControls
2. EmojiPicker component is rendered with categories and search
3. User selects an emoji by clicking
4. Selected emoji is inserted at the current cursor position in the message input
5. On message send, emoji parsing is applied to the text content

## Emoji Reactions

### Adding Reactions

1. User hovers on a message and clicks the reaction button
2. EmojiPicker appears in reaction mode
3. User selects an emoji as a reaction
4. Reaction is added to the message via WebSocket event
5. All users in the chat see the updated reactions

### Data Structure for Reactions

```typescript
interface MessageReaction {
  emoji: string;           // Unicode emoji or custom emoji ID
  count: number;           // Number of users who reacted with this emoji
  users: string[];         // Array of user IDs who reacted with this emoji
  timestamp: number;       // When the first reaction was added
}

interface MessageWithReactions extends ChatMessage {
  reactions: MessageReaction[];
}
```

## Performance Considerations

1. **Efficient Rendering**
   - Memoized emoji components to prevent unnecessary re-renders
   - Lazy-loaded emoji dataset to reduce initial load time
   - Pre-processed emoji categories for faster filtering

2. **Optimized Parsing**
   - Regex-based parsing for efficient shortcode detection
   - Cached emoji lookup for frequently used emojis
   - Batched updates for emoji reactions

## Examples

### Emoji Parsing

```typescript
// Convert shortcodes to Unicode emojis
const parseEmojis = (text: string): string => {
  return text.replace(/:([\w+-]+):/g, (match, shortcode) => {
    const emoji = emojiData.find(e => e.shortcodes.includes(shortcode));
    return emoji ? emoji.native : match;
  });
};

// Usage
const message = "Hello! :smile: :heart:";
const parsed = parseEmojis(message); // "Hello! 😊 ❤️"
```

### Emoji Reactions

```typescript
// Add a reaction to a message
const addReaction = (messageId: string, emoji: string, userId: string) => {
  socket.emit('add-reaction', { messageId, emoji, userId });
};

// Handle incoming reaction
socket.on('reaction-added', ({ messageId, emoji, userId }) => {
  // Update message reactions in state
  setMessages(messages => messages.map(msg => {
    if (msg.id !== messageId) return msg;
    
    // Find existing reaction or create new one
    const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
    
    if (existingReaction && !existingReaction.users.includes(userId)) {
      // Add user to existing reaction
      return {
        ...msg,
        reactions: msg.reactions.map(r => 
          r.emoji === emoji 
            ? { ...r, count: r.count + 1, users: [...r.users, userId] }
            : r
        )
      };
    } else if (!existingReaction) {
      // Create new reaction
      return {
        ...msg,
        reactions: [...(msg.reactions || []), {
          emoji,
          count: 1,
          users: [userId],
          timestamp: Date.now()
        }]
      };
    }
    
    return msg;
  }));
});
```

## Future Enhancements

1. **Custom Emoji Management**
   - User/admin uploadable custom emojis
   - Workspace-specific emoji sets
   - Custom emoji categories

2. **Advanced Emoji Features**
   - Emoji suggestions based on context
   - Most used emoji statistics
   - Emoji keyboard shortcuts

3. **Internationalization**
   - Localized emoji names and descriptions
   - Cultural variant support
   - Right-to-left language support
