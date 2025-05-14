import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/strore';
import { 
  setConnected, 
  addMessage, 
  updateUsers, 
  setTypingUsers,
  setConnectionHealth,
  setSubscriptionState,
  setClientEventsSupported,
  setConnectionState,
  setChatCode,
  updateConnectionInfo
} from '@/features/chatSlice';
import { ChatMessage, ConnectionHealthStatus } from '@/types/chat';
import { evaluateConnectionHealth } from '@/utils/connectionUtils';
import { isMessageDeliveryWorking } from '@/utils/messageUtils';

/**
 * Custom hook to work with chat state in Redux
 */
export function useChatState() {
  const dispatch = useDispatch();
  
  // Get states from Redux
  const messages = useSelector((state: RootState) => state.chat.messages);
  const users = useSelector((state: RootState) => state.chat.users);
  const typingUsers = useSelector((state: RootState) => state.chat.typingUsers);
  const isConnected = useSelector((state: RootState) => state.chat.isConnected);  // Calculated connection health - more detailed than just boolean connected status
  const connectionHealth = useMemo((): ConnectionHealthStatus => {
    // Count received messages from others (not system messages or our own)
    const receivedMessages = messages.filter(msg => 
      msg.type === "message" && msg.sender && !msg.isSent
    );
    
    // Find the timestamp of the last received message
    const lastMessageTime = receivedMessages.length > 0 
      ? new Date(receivedMessages[receivedMessages.length - 1].timestamp).getTime()
      : undefined;
    
    // Check if message delivery seems to be working properly
    // This helps detect one-way connection issues
    const currentUser = messages.find(msg => msg.isSent)?.sender || '';
    const deliveryWorking = isMessageDeliveryWorking(messages, currentUser);
    
    // If connected but message delivery seems broken, downgrade to just 'connected'
    if (isConnected && !deliveryWorking && users.length > 1) {
      console.log("[ChatState] Message delivery may not be working properly");
      return "connected";
    }
    
    // Use our utility function to evaluate connection health
    return evaluateConnectionHealth(
      isConnected,
      receivedMessages.length,
      users.length,
      lastMessageTime
    );
  }, [isConnected, users.length, messages]);
  
  // Get additional connection states
  const isFullySubscribed = useSelector((state: RootState) => state.chat.isFullySubscribed);
  const clientEventsSupported = useSelector((state: RootState) => state.chat.clientEventsSupported);
  const connectionState = useSelector((state: RootState) => state.chat.connectionState);
  const chatCode = useSelector((state: RootState) => state.chat.chatCode);

  // Callback functions to update state
  const setConnectionStatus = useCallback((status: boolean) => {
    dispatch(setConnected(status));
  }, [dispatch]);
  
  const addChatMessage = useCallback((message: ChatMessage) => {
    dispatch(addMessage(message));
  }, [dispatch]);
  
  const updateChatUsers = useCallback((users: string[]) => {
    dispatch(updateUsers(users));
  }, [dispatch]);
  
  const updateTypingStatus = useCallback((users: string[]) => {
    dispatch(setTypingUsers(users));
  }, [dispatch]);
  
  const updateConnectionHealth = useCallback((status: ConnectionHealthStatus) => {
    dispatch(setConnectionHealth(status));
  }, [dispatch]);
  
  // New functions for enhanced connection state management
  const setSubscriptionStateStatus = useCallback((status: boolean) => {
    dispatch(setSubscriptionState(status));
  }, [dispatch]);
  
  const setClientEventsSupportedStatus = useCallback((status: boolean) => {
    dispatch(setClientEventsSupported(status));
  }, [dispatch]);
  
  const setConnectionStateStatus = useCallback((state: string) => {
    dispatch(setConnectionState(state));
  }, [dispatch]);
  
  const setChatCodeValue = useCallback((code: string) => {
    dispatch(setChatCode(code));
  }, [dispatch]);
  
  const updateConnectionInfoStatus = useCallback((info: {
    isConnected: boolean;
    isFullySubscribed: boolean;
    clientEventsSupported: boolean;
    connectionState: string;
  }) => {
    dispatch(updateConnectionInfo(info));
  }, [dispatch]);
  
  return {
    // State
    messages,
    users,
    typingUsers,
    isConnected,
    connectionHealth,
    isFullySubscribed,
    clientEventsSupported,
    connectionState,
    chatCode,
      // Actions
    setConnectionStatus,
    addChatMessage,
    updateChatUsers,
    updateTypingStatus,
    updateConnectionHealth,
    setSubscriptionStateStatus,
    setClientEventsSupportedStatus,
    setConnectionStateStatus,
    setChatCodeValue,
    updateConnectionInfoStatus
  };
}
