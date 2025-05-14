"use client";
import { useEffect, useRef, useState, useMemo } from 'react';
import PusherJS, { Channel, PresenceChannel } from "pusher-js";
import { ChatMessage, ChatUser, UsePusherChatOptions, TypingStatusEvent } from '@/types/chat';
import { UserLeavingEvent } from '@/types/userEvents';
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
  const isInitializedRef = useRef(false);
  
  // Set up the Pusher connection and event handling
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
      console.log("[Chat] Subscribing to channel:", channelName);      const channel = pusher.subscribe(channelName) as PresenceChannel;
      channelRef.current = channel;      // When subscription succeeds
      channel.bind("pusher:subscription_succeeded", (members: { each: (cb: (member: ChatUser) => void) => void }) => {
        if (!isMountedRef.current) return;
        
        console.log("[Chat] Subscription succeeded, initializing users");
        setIsConnected(true);
        
        // Force a state update for subscription status
        isSubscribedRef.current = true; // Mark channel as fully subscribed
        setIsFullySubscribed(true);
        
        // Initialize users list
        const initialUsers: string[] = [];
        members.each((member) => {
          initialUsers.push(member.id);
        });
        
        // Force a short delay before updating users to ensure all presence channel
        // operations have completed on the server side
        setTimeout(() => {
          if (isMountedRef.current) {
            console.log("[Chat] Updating initial users:", initialUsers);
            onUsersChangeRef.current(initialUsers);
            
            // Emit a test client event to verify client events support
            try {
              channel.trigger("client-testing", { test: true });
              // If we can emit without error, client events might be supported
              // but we'll wait for confirmation from received events
            } catch (err) {
              console.log("[Chat] Client events not supported:", err);
              clientEventsEnabledRef.current = false;
              setClientEventsSupported(false);
            }
          }
        }, 500);      });
      
      // User joined event
      channel.bind("pusher:member_added", (member: ChatUser) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] User joined:", member.id);
        
        // Small delay to ensure Pusher has fully processed the member
        setTimeout(() => {
          if (isMountedRef.current) {
            onUsersChangeRef.current((prev) => {
              // Only add if not already in the list (avoid duplicates)
              if (prev.includes(member.id)) {
                return prev;
              }
              return [...prev, member.id];
            });
          }
        }, 200);
      });
      
      // User left event
      channel.bind("pusher:member_removed", (member: ChatUser) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] User left:", member.id);
        
        // Small delay to ensure Pusher has fully processed the removal
        setTimeout(() => {
          if (isMountedRef.current) {
            onUsersChangeRef.current((prev) => prev.filter((id) => id !== member.id));
          }
        }, 200);
      });
      
      // New message from server
      channel.bind("new-message", (data: ChatMessage) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Message received from server:", data);
        onMessageReceivedRef.current(data, false);
      });
        // New message via client event
      channel.bind("client-message", (data: ChatMessage) => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Message received via client event:", data);
        clientEventsEnabledRef.current = true;
        // Force state update for client events status
        setClientEventsSupported(true);
        onMessageReceivedRef.current(data, true);      });
        // Test client events support
      channel.bind("client-testing", () => {
        if (!isMountedRef.current) return;
        console.log("[Chat] Client events test successful");
        clientEventsEnabledRef.current = true;
        // Force state update for client events status
        setClientEventsSupported(true);      });
      
      // Typing indicator
      channel.bind("client-typing", (data: TypingStatusEvent) => {
        if (!isMountedRef.current || data.userId === userId) return;
        console.log("[Chat] Typing status received:", data);
        if (onTypingStatusUpdateRef.current) {
          onTypingStatusUpdateRef.current(data.userId, data.isTyping);
        }
      });
        // Explicit user leaving event (faster than waiting for presence channel update)
      channel.bind("client-user-leaving", (data: UserLeavingEvent) => {
        if (!isMountedRef.current || data.userId === userId) return;
        console.log("[Chat] User explicitly left:", data.userId, "at", data.timestamp);
        
        // Update users list immediately
        setTimeout(() => {
          if (isMountedRef.current) {
            onUsersChangeRef.current((prev) => prev.filter((id) => id !== data.userId));
          }
        }, 50); // Use a very short delay
      });        // Attach to connection state changes for detailed connection monitoring
      pusher.connection.bind('state_change', (states: {
        previous: string;
        current: string;
      }) => {
        console.log("[Chat] Connection state changed:", states.previous, "->", states.current);
        
        // Update connection state based on Pusher's connection states
        switch (states.current) {
          case 'connected':
            console.log("[Chat] Connection established successfully");
            setIsConnected(true);
            break;
            
          case 'connecting':
            console.log("[Chat] Attempting to establish connection...");
            // Don't change isConnected yet to avoid UI flashing during reconnection attempts
            break;
            
          case 'disconnected':
            console.log("[Chat] Disconnected, will attempt to reconnect");
            setIsConnected(false);
            break;
            
          case 'failed':
            console.error("[Chat] Connection failed");
            setIsConnected(false);
            // Reset subscription state since we'll need to resubscribe after reconnection
            isSubscribedRef.current = false;
            break;
            
          case 'unavailable':
            console.error("[Chat] Connection unavailable - network issue likely");
            setIsConnected(false);
            // Reset subscription state since we'll need to resubscribe after reconnection
            isSubscribedRef.current = false;
            break;
            
          default:
            console.log(`[Chat] Connection in ${states.current} state`);
            break;
        }
      });} catch (error) {
      console.error("[Chat] Error setting up Pusher:", error);
    }
    
    // Cleanup function
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
            // Explicitly leave the presence channel to immediately notify other users
          // This helps with faster user departure notification
          try {
            const presenceChannel = localChannel as PresenceChannel;
            // Check if we have a valid presence channel with members
            if (presenceChannel && presenceChannel.members && presenceChannel.members.me) {              // Send a client event notifying explicit departure if client events are supported
              if (clientEventsEnabledRef.current) {
                const leavingEvent: UserLeavingEvent = {
                  userId,
                  timestamp: new Date().toISOString()
                };
                presenceChannel.trigger('client-user-leaving', leavingEvent);
              }
            }
          } catch (e) {
            console.log("[Chat] Failed to send departure event:", e);
          }
        }
        
        // Only release the client once we've cleaned up the channel
        pusherClientManager.releaseClient();        // Clear all refs to prevent stale references
        channelRef.current = null;
        pusherRef.current = null;
        isInitializedRef.current = false;
        isSubscribedRef.current = false; // Reset subscription state
        
        // Reset state variables
        setIsConnected(false);
        setConnectionState('none');
        setIsFullySubscribed(false);
        setClientEventsSupported(false);
        
        console.log("[Chat] Cleanup completed for chatCode:", chatCode);
      } catch (error) {
        console.error("[Chat] Error during cleanup:", error);
      }    };
  }, [chatCode, userId]); // Only depend on the stable values to avoid unnecessary reconnections
    // Create stable message sending function
  const sendMessage = useRef((message: ChatMessage): boolean => {
    if (!channelRef.current || !isMountedRef.current) return false;
    
    try {
      const channel = channelRef.current as PresenceChannel;
        // Check if we're fully connected and subscribed
      const isFullyConnected = isSubscribedRef.current && 
                             pusherRef.current?.connection.state === 'connected';
      
      console.log("[Chat] Send message - Connection status:", 
        isSubscribedRef.current, pusherRef.current?.connection.state,
        "Client events:", clientEventsEnabledRef.current);
        
      let messageSent = false;
      
      // Use client events if they work AND we're fully subscribed
      if (clientEventsEnabledRef.current && isFullyConnected) {
        try {
          channel.trigger("client-message", message);
          messageSent = true;
          console.log("[Chat] Message sent via client event");
          
          // Success confirms client events work
          clientEventsEnabledRef.current = true;
        } catch (err) {
          console.error("[Chat] Failed to send via client event:", err);
          
          // Mark client events as not working if we get an error
          clientEventsEnabledRef.current = false;
          
          // Fall back to server API
          messageSent = false;
        }
      } 
      
      // If client events didn't work or aren't enabled yet, use the server API
      if (!messageSent) {
        console.log("[Chat] Sending message via server API");
        // Always use the server API when not fully subscribed
        fetch('/api/pusher/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, chatCode }),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          console.log("[Chat] Successfully sent message via API");
          messageSent = true;
        })
        .catch(error => {
          console.error("[Chat] API error:", error);
        });
        
        // Only attempt client events on first message to see if they work
        // We'll only do this if we haven't already tried AND we're fully subscribed
        if (!clientEventsEnabledRef.current && isFullyConnected) {
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
  }).current;  // Create stable typing indicator function
  const sendTypingStatus = useRef((isTyping: boolean): void => {
    if (!channelRef.current || !isMountedRef.current) return;
    
    // Check connection and subscription status
    const isFullyConnected = isSubscribedRef.current && 
                           pusherRef.current?.connection.state === 'connected';
    
    // Don't try to send typing events if the channel isn't fully subscribed yet
    if (!isFullyConnected) {
      console.log("[Chat] Skipping typing status - not fully connected yet");
      return;
    }
    
    try {
      const channel = channelRef.current as PresenceChannel;
      channel.trigger("client-typing", { userId, isTyping });
      
      // If we successfully send a typing status, client events should be working
      if (!clientEventsEnabledRef.current) {
        console.log("[Chat] Client events confirmed working from typing status");
        clientEventsEnabledRef.current = true;
        setClientEventsSupported(true);
      }
    } catch (error) {
      console.error("[Chat] Error sending typing status:", error);
      clientEventsEnabledRef.current = false;
      setClientEventsSupported(false);
    }
  }).current;// Track connection state separately to ensure it updates
  const [connectionState, setConnectionState] = useState<string>('none');
  
  // Update connection state whenever it changes
  useEffect(() => {
    if (pusherRef.current?.connection) {
      setConnectionState(pusherRef.current.connection.state);
      
      // Listen for state changes
      const updateState = (state: string) => {
        setConnectionState(state);
      };
      
      // Bind to connection state changes
      pusherRef.current.connection.bind('state_change', (states: {
        previous: string;
        current: string;
      }) => {
        updateState(states.current);
      });
      
      // Cleanup listener
      return () => {
        pusherRef.current?.connection?.unbind('state_change', updateState);
      };
    }
  }, [pusherRef.current?.connection]);
    // Create state variables to track ref values for proper reactivity
  const [isFullySubscribed, setIsFullySubscribed] = useState(false);
  const [clientEventsSupported, setClientEventsSupported] = useState(false);
  
  // Update the state variables when ref values change
  useEffect(() => {
    // Create an interval to check for changes
    const checkInterval = setInterval(() => {
      if (isFullySubscribed !== isSubscribedRef.current) {
        setIsFullySubscribed(isSubscribedRef.current);
      }
      if (clientEventsSupported !== clientEventsEnabledRef.current) {
        setClientEventsSupported(clientEventsEnabledRef.current);
      }
    }, 300);
    
    return () => clearInterval(checkInterval);
  }, [isFullySubscribed, clientEventsSupported]);
  
  // Provide more detailed connection information  
  const connectionInfo = useMemo(() => {
    return {
      isConnected,
      isFullySubscribed,
      clientEventsSupported,
      connectionState
    };
  }, [isConnected, isFullySubscribed, clientEventsSupported, connectionState]);  return {
    sendMessage,
    sendTypingStatus,
    isConnected,
    connectionInfo
  };
}
