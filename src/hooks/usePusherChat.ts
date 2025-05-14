"use client";
import { useEffect, useRef, useState } from 'react';
import PusherJS, { Channel, PresenceChannel } from "pusher-js";
import { ChatMessage, ChatUser, UsePusherChatOptions, TypingStatusEvent } from '@/types/chat';
import { getPusherClient, pusherClientManager } from '@/services/pusherClient';

/**
 * Custom hook to handle Pusher chat functionality
 * Manages presence channel subscription, user tracking, and message events
 * Uses a singleton pattern to prevent WebSocket connection issues
 */
export function usePusherChat({
  chatCode,
  userId,
  onUsersChange,
  onMessageReceived,
  onTypingStatusUpdate
}: UsePusherChatOptions) {
  // To track actual connection state
  const [isConnected, setIsConnected] = useState(false);
  
  // Store references that persist across renders
  const channelRef = useRef<Channel | null>(null);
  const clientEventsEnabledRef = useRef<boolean>(false);
  const isMountedRef = useRef(true);
  const pusherRef = useRef<PusherJS | null>(null);
  const chatCodeRef = useRef<string>(chatCode);
  const isSubscribedRef = useRef<boolean>(false); // Track if channel is fully subscribed
  
  // Store callback references to prevent unnecessary effect triggers
  const onUsersChangeRef = useRef(onUsersChange);
  const onMessageReceivedRef = useRef(onMessageReceived);
  const onTypingStatusUpdateRef = useRef(onTypingStatusUpdate);
  
  // Update refs when props change
  useEffect(() => {
    onUsersChangeRef.current = onUsersChange;
    onMessageReceivedRef.current = onMessageReceived;
    if (onTypingStatusUpdate) {
      onTypingStatusUpdateRef.current = onTypingStatusUpdate;
    }
    chatCodeRef.current = chatCode;
  }, [chatCode, onUsersChange, onMessageReceived, onTypingStatusUpdate]);
  
  // Flag to prevent duplicate initialization
  const isInitializedRef = useRef(false);  // Set up the Pusher connection and event handling
  useEffect(() => {
    console.log("[Chat] Initializing effect for chat:", chatCode);
    
    // Skip initialization if component unmounted
    if (!isMountedRef.current) {
      console.log("[Chat] Component not mounted, skipping setup");
      return;
    }
    
    // Track channel name consistently
    const channelName = `presence-chat-${chatCode}`;
    
    // Check if we're already connected to the correct channel
    const currentChannel = channelRef.current?.name;
    if (isInitializedRef.current && currentChannel === channelName) {
      console.log("[Chat] Already connected to the correct channel, skipping");
      return;
    }
    
    // If we're connected to a different channel, clean up first
    if (isInitializedRef.current && channelRef.current && currentChannel !== channelName) {
      console.log("[Chat] Channel changed, cleaning up previous channel");
      
      try {
        // Clean up old channel
        channelRef.current.unbind_all();
        if (pusherRef.current) {
          pusherRef.current.unsubscribe(currentChannel || '');
        }
        channelRef.current = null;
      } catch (error) {
        console.error("[Chat] Error cleaning up previous channel:", error);
      }
    }
    
    console.log("[Chat] Setting up chat for:", chatCode);
    isInitializedRef.current = true;
    
    try {
      // Get a shared Pusher instance
      const pusher = getPusherClient(userId);
      pusherRef.current = pusher;
      
      // Subscribe to the chat channel if not already subscribed
      console.log("[Chat] Subscribing to channel:", channelName);
      const channel = pusher.subscribe(channelName) as PresenceChannel;
      channelRef.current = channel;      // When subscription succeeds
      channel.bind("pusher:subscription_succeeded", (members: { each: (cb: (member: ChatUser) => void) => void }) => {
        if (!isMountedRef.current) return;
        
        console.log("[Chat] Subscription succeeded, initializing users");
        setIsConnected(true);
        isSubscribedRef.current = true; // Mark channel as fully subscribed
        
        // Initialize users list
        const initialUsers: string[] = [];
        members.each((member) => {
          initialUsers.push(member.id);
        });
        onUsersChangeRef.current(initialUsers);
      });
      
      // User joined event
      channel.bind("pusher:member_added", (member: ChatUser) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] User joined:", member.id);
        onUsersChangeRef.current((prev) => [...prev, member.id]);
      });
      
      // User left event
      channel.bind("pusher:member_removed", (member: ChatUser) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] User left:", member.id);
        onUsersChangeRef.current((prev) => prev.filter((id) => id !== member.id));
      });
      
      // New message from server
      channel.bind("new-message", (data: ChatMessage) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Message received from server:", data);
        onMessageReceivedRef.current(data, false);
      });      // New message via client event
      channel.bind("client-message", (data: ChatMessage) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Message received via client event:", data);
        clientEventsEnabledRef.current = true;
        onMessageReceivedRef.current(data, true);
      });
        // Test client events support
      channel.bind("client-testing", () => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Client events test successful");
        clientEventsEnabledRef.current = true;
      });
      
      // Typing indicator
      channel.bind("client-typing", (data: TypingStatusEvent) => {
        if (!isMountedRef.current || data.userId === userId) return;
        console.log("[Chat] Typing status received:", data);
        if (onTypingStatusUpdateRef.current) {
          onTypingStatusUpdateRef.current(data.userId, data.isTyping);
        }
      });
      
      // Optional: attach to connection state changes for better monitoring
      pusher.connection.bind('state_change', (states: {
        previous: string;
        current: string;
      }) => {
        console.log("[Chat] Connection state changed:", states.previous, "->", states.current);
        if (states.current === 'connected') {
          setIsConnected(true);
        } else if (states.current === 'disconnected' || states.current === 'failed') {
          setIsConnected(false);
        }
      });
    } catch (error) {
      console.error("[Chat] Error setting up Pusher:", error);
    }      // Cleanup function
    return () => {
      console.log("[Chat] Running cleanup for chatCode:", chatCode);
      
      // Mark as unmounted first to prevent further updates
      isMountedRef.current = false;
      
      try {
        // We only want to clean up if this is a genuine unmount
        // or if we're reconnecting to a different channel
        const localChannel = channelRef.current;
        
        // First unbind all events to prevent further callbacks
        if (localChannel) {
          console.log("[Chat] Unbinding events from channel:", localChannel.name);
          localChannel.unbind_all();
        }
        
        // Only release the client once we've cleaned up the channel
        pusherClientManager.releaseClient();
          // Clear all refs to prevent stale references
        channelRef.current = null;
        pusherRef.current = null;
        isInitializedRef.current = false;
        isSubscribedRef.current = false; // Reset subscription state
        setIsConnected(false);
        
        console.log("[Chat] Cleanup completed for chatCode:", chatCode);
      } catch (error) {
        console.error("[Chat] Error during cleanup:", error);
      }
    };
  }, [chatCode, userId]); // Only depend on the stable values to avoid unnecessary reconnections
  // Create stable message sending function
  const sendMessage = useRef((message: ChatMessage): boolean => {
    if (!channelRef.current || !isMountedRef.current) return false;
    
    try {
      const channel = channelRef.current as PresenceChannel;
      
      // Use client events if they work AND we're fully subscribed
      if (clientEventsEnabledRef.current && isSubscribedRef.current) {
        channel.trigger("client-message", message);
      } else {
        // Always use the server API when not fully subscribed
        fetch('/api/pusher/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, chatCode }),
        })
        .then(response => response.json())
        .catch(error => {
          console.error("[Chat] API error:", error);
        });
        
        // Only attempt client events on first message to see if they work
        // We'll only do this if we haven't already tried AND we're fully subscribed
        if (!clientEventsEnabledRef.current && isSubscribedRef.current) {
          try {
            console.log("[Chat] Testing client events support...");
            channel.trigger("client-testing", { test: true });
            // If we get here, client events might work, but we'll wait for confirmation
            // via received events before switching strategies
          } catch (err) {
            console.log("[Chat] Client events not supported:", err);
          }
        }
      }
      return true;
    } catch (error) {
      console.error("[Chat] Error sending message:", error);
      return false;
    }
  }).current;
  // Create stable typing indicator function
  const sendTypingStatus = useRef((isTyping: boolean): void => {
    if (!channelRef.current || !isMountedRef.current) return;
    
    // Don't try to send typing events if the channel isn't fully subscribed yet
    if (!isSubscribedRef.current) {
      console.log("[Chat] Skipping typing status - channel not fully subscribed yet");
      return;
    }
    
    try {
      const channel = channelRef.current as PresenceChannel;
      channel.trigger("client-typing", { userId, isTyping });
    } catch (error) {
      console.error("[Chat] Error sending typing status:", error);
    }
  }).current;

  return {
    sendMessage,
    sendTypingStatus,
    isConnected
  };
}
