import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ChatMessage, ConnectionHealthStatus } from '@/types/chat';

export interface ChatState {
  // Represents a single chat message object
  messages: ChatMessage[];
  // List of users currently in the chat room
  users: string[];
  // Indicates if the client is currently connected to the chat server
  isConnected: boolean;
  // Describes the health of the connection (e.g., 'good', 'unstable', 'disconnected')
  connectionHealth: ConnectionHealthStatus;
  // List of users currently typing
  typingUsers: string[];
  // Tracks message IDs that have already been seen to prevent duplicates
  messageIdsSeen: string[];
  // Indicates if the client is fully subscribed to the chat room
  isFullySubscribed: boolean;
  // Indicates if the client supports custom client events
  clientEventsSupported: boolean;
  // Represents the current state of the socket connection (e.g., 'connecting', 'connected', 'disconnected', etc.)
  connectionState: string;
  // Unique code for the chat room, or null if not set
  chatCode: string | null;
}

const initialState: ChatState = {
  messages: [],
  users: [],
  isConnected: false,
  connectionHealth: 'disconnected',
  typingUsers: [],
  messageIdsSeen: [],
  isFullySubscribed: false,
  clientEventsSupported: false,
  connectionState: 'none',
  chatCode: null,
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      const newConnectedState = action.payload;
      state.isConnected = newConnectedState;
      
      // Also update connection health if disconnected
      if (!newConnectedState) {
        state.connectionHealth = 'disconnected';
      }
    },
    
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      // Check if we've already seen this message ID (if it has one)
      if (action.payload.messageId) {
        if (state.messageIdsSeen.includes(action.payload.messageId)) {
          return; // Skip duplicate messages
        }
        
        // Add to seen messages
        state.messageIdsSeen.push(action.payload.messageId);
        
        // Keep seen message IDs list manageable
        if (state.messageIdsSeen.length > 100) {
          state.messageIdsSeen = state.messageIdsSeen.slice(-100);
        }
      }
      
      state.messages.push(action.payload);
    },
    
    updateUsers: (state, action: PayloadAction<string[]>) => {
      // Update state with new users list
      state.users = action.payload;
      return state;
    },
    
    setTypingUsers: (state, action: PayloadAction<string[]>) => {
      state.typingUsers = action.payload;
    },
    
    clearMessages: (state) => {
      state.messages = [];
    },
    
    setConnectionHealth: (state, action: PayloadAction<ConnectionHealthStatus>) => {
      state.connectionHealth = action.payload;
    },
    
    setSubscriptionState: (state, action: PayloadAction<boolean>) => {
      state.isFullySubscribed = action.payload;
    },
    
    setClientEventsSupported: (state, action: PayloadAction<boolean>) => {
      state.clientEventsSupported = action.payload;
    },
    
    setConnectionState: (state, action: PayloadAction<string>) => {
      state.connectionState = action.payload;
    },
    
    setChatCode: (state, action: PayloadAction<string>) => {
      state.chatCode = action.payload;
    },
    
    updateConnectionInfo: (state, action: PayloadAction<{
      isConnected: boolean;
      isFullySubscribed: boolean;
      clientEventsSupported: boolean;
      connectionState: string;
    }>) => {
      const { isConnected, isFullySubscribed, clientEventsSupported, connectionState } = action.payload;
      state.isConnected = isConnected;
      state.isFullySubscribed = isFullySubscribed;
      state.clientEventsSupported = clientEventsSupported;
      state.connectionState = connectionState;
      
      // Also update connection health if disconnected
      if (!isConnected) {
        state.connectionHealth = 'disconnected';
      }
    }
  },
});

export const { 
  setConnected, 
  addMessage, 
  updateUsers, 
  setTypingUsers, 
  clearMessages,
  setConnectionHealth,
  setSubscriptionState,
  setClientEventsSupported,
  setConnectionState,
  setChatCode,
  updateConnectionInfo
} = chatSlice.actions;

export default chatSlice.reducer;
