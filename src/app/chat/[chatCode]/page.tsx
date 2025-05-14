"use client";
import React, { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { usePusherChat } from "@/hooks/usePusherChat";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { useTypingIndicators } from "@/hooks/useTypingIndicators";
import { ChatMessage } from "@/types/chat";
import { createMessageTimestamp } from "@/utils/dateUtils";

const Page = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Start empty for SSR/CSR match
  const [input, setInput] = useState(""); const [users, setUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const chatCode = params?.chatCode as string;
  const userId = useRef(nanoid(10)).current;
  const { typingUsers, setUserTyping } = useTypingIndicators(3000); // 3 second expiry// Set initial messages only on client to avoid hydration mismatch
  useEffect(() => {
    setMessages([
      {
        type: 'system',
        message: 'Welcome to the chat!',
        timestamp: createMessageTimestamp(),
      },
    ]);
  }, []);  // Keep track of message IDs we've already seen
  const processedMessageIds = useRef(new Set<string>());

  // Handle when a new message is received
  const handleMessageReceived = (message: ChatMessage, isClientEvent: boolean) => {
    console.log(`[Chat] Message received via ${isClientEvent ? 'client' : 'server'} event:`, message);

    // Clear typing indicator when a message is received from that user
    if (message.sender && message.sender !== userId) {
      setUserTyping(message.sender, false);
    }

    // Skip messages from ourselves - we already added them to the UI when sending
    if (message.sender === userId) {
      console.log("[Chat] Skipping message from self (already displayed)");
      return;
    }

    // Skip duplicates if we have a messageId
    if (message.messageId && processedMessageIds.current.has(message.messageId)) {
      console.log("[Chat] Skipping duplicate message with ID:", message.messageId);
      return;
    }

    // Add messageId to our set of processed IDs if it exists
    if (message.messageId) {
      processedMessageIds.current.add(message.messageId);
    }

    setMessages((prev) => [
      ...prev,
      {
        ...message,
        isSent: message.sender === userId,
      },
    ]);
  };

  // Handle typing status updates from other users
  const handleTypingStatusUpdate = (typingUserId: string, isTyping: boolean) => {
    setUserTyping(typingUserId, isTyping);
  };
  // Track previous user count to determine new joins
  const prevUsersRef = useRef<string[]>([]);
  // Handle when users change (new users join or leave)
  const handleUsersChange = (newUsers: string[] | ((prev: string[]) => string[])) => {
    // Calculate the new state based on the setter function
    const calculatedNewUsers = typeof newUsers === 'function'
      ? newUsers(prevUsersRef.current)
      : newUsers;

    // Check for new users that weren't in the previous list
    const currentUsers = new Set(prevUsersRef.current);
    const newlyJoinedUsers = calculatedNewUsers.filter(id => !currentUsers.has(id) && id !== userId);

    // Show system message for newly joined users
    if (newlyJoinedUsers.length > 0) {
      newlyJoinedUsers.forEach(newUserId => {
        setMessages(prev => [
          ...prev,
          {
            type: 'system',
            message: `User-${newUserId.substring(0, 4)} joined the chat`,
            timestamp: createMessageTimestamp(),
          }
        ]);
      });
    }

    // Check for users who have left
    const newUsersSet = new Set(calculatedNewUsers);
    const usersWhoLeft = prevUsersRef.current.filter(id => !newUsersSet.has(id) && id !== userId);

    // Show system message for users who left
    if (usersWhoLeft.length > 0) {
      usersWhoLeft.forEach(leftUserId => {
        setMessages(prev => [
          ...prev,
          {
            type: 'system',
            message: `User-${leftUserId.substring(0, 4)} left the chat`,
            timestamp: createMessageTimestamp(),
          }
        ]);
      });
    }

    // Update state and ref
    setUsers(calculatedNewUsers);
    prevUsersRef.current = Array.isArray(calculatedNewUsers) ? calculatedNewUsers : [];
  };

  // Initialize Pusher chat hook
  const { sendMessage, sendTypingStatus, isConnected } = usePusherChat({
    chatCode,
    userId,
    onUsersChange: handleUsersChange,
    onMessageReceived: handleMessageReceived,
    onTypingStatusUpdate: handleTypingStatusUpdate
  });

  // Play notification sounds when new messages arrive
  useNotificationSound(messages, userId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]); const handleSend = () => {
    if (!input.trim() || !isConnected) return;

    // Generate a unique message ID using nanoid
    const messageId = nanoid(10);

    const msg: ChatMessage = {
      type: "message",
      sender: userId,
      message: input,
      timestamp: createMessageTimestamp(),
      messageId
    };

    // Add the message to our local state immediately
    setMessages((prev) => [
      ...prev,
      { ...msg, isSent: true },
    ]);

    // Send via our custom hook
    sendMessage(msg);

    // Explicitly clear typing status when sending a message
    sendTypingStatusRef.current(false);

    // Clear input field
    setInput("");
  };
  // Track when the user is typing to send status updates
  // Use a ref to track previous input to avoid redundant typing status updates
  const prevInputRef = useRef(input);
  const prevIsConnectedRef = useRef(isConnected);
  // Create a stable ref for sendTypingStatus to avoid dependency issues
  const sendTypingStatusRef = useRef(sendTypingStatus);
  useEffect(() => {
    sendTypingStatusRef.current = sendTypingStatus;
  }, [sendTypingStatus]);
  // Reference for the typing timer
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only proceed if connected
    if (!isConnected) return;

    // Clear any previous timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }

    // Determine typing status
    const wasTyping = prevInputRef.current.trim().length > 0;
    const isTyping = input.trim().length > 0;
    const connectionChanged = prevIsConnectedRef.current !== isConnected;

    // Update refs
    prevInputRef.current = input;
    prevIsConnectedRef.current = isConnected;

    // Only send typing status when it changes or connection status changes
    if ((wasTyping !== isTyping || connectionChanged) && isConnected) {
      sendTypingStatusRef.current(isTyping);
    } else if (isTyping && isConnected) {
      // For longer typing sessions, send an update every 3 seconds to keep status active
      typingTimerRef.current = setTimeout(() => {
        sendTypingStatusRef.current(true);
      }, 3000);
    }

    // If typing, set a timer to clear typing status after inactivity
    if (isTyping) {
      const timer = setTimeout(() => {
        sendTypingStatusRef.current(false);
      }, 3500);

      return () => {
        clearTimeout(timer);
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
      };
    }
  }, [input, isConnected]);

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader userCount={users.length} chatCode={chatCode} />
        <div className="flex-1 overflow-y-auto mb-35">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 mb-35 mx-auto w-full max-w-2xl">
          {typingUsers.length > 0 && (
            <div className="mb-2 px-4 animate-fade-in transition-all duration-300 ease-in-out">
              <TypingIndicator typingUsers={typingUsers} />
            </div>
          )}
          <ChatControls input={input} setInput={setInput} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default Page;