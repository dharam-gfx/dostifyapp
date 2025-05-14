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
import { useChatState } from "@/hooks/useChatState";
import { ChatMessage } from "@/types/chat";
import { createMessageTimestamp } from "@/utils/dateUtils";
import { calculateReconnectionDelay, shouldRefreshPage } from "@/utils/connectionUtils";

const Page = () => {  // Use Redux state for chat messages and status
    const {
        messages,
        users,
        typingUsers,
        isConnected: reduxConnected,
        connectionHealth,
        addChatMessage,
        updateChatUsers,
        updateTypingStatus,
        setConnectionStatus,
        updateConnectionHealth
    } = useChatState();

    // Refs to track connection state changes
    const prevConnectionStateRef = useRef<string>( 'none' );
    const prevIsSubscribedRef = useRef<boolean>( false );
    const reconnectAttemptsRef = useRef<number>( 0 );

    // Keep local state for input and UI elements
    const [input, setInput] = useState( "" );
    const messagesEndRef = useRef<HTMLDivElement>( null );
    const params = useParams();
    const chatCode = params?.chatCode as string;
    const userId = useRef( nanoid( 10 ) ).current;

    // Local typing indicator state
    const { setUserTyping } = useTypingIndicators( 3000 ); // 3 second expiry  // Add welcome message on first render
    useEffect( () => {
        // Only add welcome message if there are no messages yet
        if ( messages.length === 0 ) {
            addChatMessage( {
                type: 'system',
                message: 'Welcome to the chat!',
                timestamp: createMessageTimestamp(),
            } );
        }
    }, [messages.length, addChatMessage] );  // Keep track of message IDs we've already seen
    const processedMessageIds = useRef( new Set<string>() );
    // Handle when a new message is received
    const handleMessageReceived = ( message: ChatMessage, isClientEvent: boolean ) => {
        console.log( `[Chat] Message received via ${isClientEvent ? 'client' : 'server'} event:`, message );

        // Clear typing indicator when a message is received from that user
        if ( message.sender && message.sender !== userId ) {
            setUserTyping( message.sender, false );
        }

        // Skip messages from ourselves - we already added them to the UI when sending
        if ( message.sender === userId ) {
            console.log( "[Chat] Skipping message from self (already displayed)" );
            return;
        }

        // Skip duplicates if we have a messageId
        if ( message.messageId && processedMessageIds.current.has( message.messageId ) ) {
            console.log( "[Chat] Skipping duplicate message with ID:", message.messageId );
            return;
        }

        // Add messageId to our set of processed IDs if it exists
        if ( message.messageId ) {
            processedMessageIds.current.add( message.messageId );
        }

        // Add message to Redux store
        addChatMessage( {
            ...message,
            isSent: message.sender === userId,
        } );
    };
    // Handle typing status updates from other users
    const handleTypingStatusUpdate = ( typingUserId: string, isTyping: boolean ) => {
        setUserTyping( typingUserId, isTyping );

        // Update global typing status in Redux store
        if ( isTyping ) {
            // Add the user to typing users if not already there
            updateTypingStatus( [...typingUsers, typingUserId] );
        } else {
            // Remove the user from typing users
            updateTypingStatus( typingUsers.filter( id => id !== typingUserId ) );
        }
    };
    // Track previous user count to determine new joins
    const prevUsersRef = useRef<string[]>( [] );  // Handle when users change (new users join or leave)
    const handleUsersChange = ( newUsers: string[] | ( ( prev: string[] ) => string[] ) ) => {
        // Calculate the new state based on the setter function
        const calculatedNewUsers = typeof newUsers === 'function'
            ? newUsers( prevUsersRef.current )
            : newUsers;

        console.log( "[Chat] Users changed. Previous:", prevUsersRef.current, "New:", calculatedNewUsers );

        // Skip processing if arrays are empty or identical
        if ( calculatedNewUsers.length === 0 && prevUsersRef.current.length === 0 ) {
            return;
        }

        // Ensure our own user ID is in the list if we're connected
        let finalUsersList = [...calculatedNewUsers];
        if ( reduxConnected && calculatedNewUsers.length > 0 && !calculatedNewUsers.includes( userId ) ) {
            finalUsersList = [...calculatedNewUsers, userId];
        }

        // Update the users state in Redux
        updateChatUsers( finalUsersList );

        // Check for new users that weren't in the previous list
        const currentUsers = new Set( prevUsersRef.current );
        const newlyJoinedUsers = finalUsersList.filter( id => !currentUsers.has( id ) && id !== userId );

        // Check for users who have left
        const newUsersSet = new Set( finalUsersList );
        const usersWhoLeft = prevUsersRef.current.filter( id => !newUsersSet.has( id ) && id !== userId );

        // Update our reference for the next change
        prevUsersRef.current = finalUsersList;    // Show system message for newly joined users
        if ( newlyJoinedUsers.length > 0 ) {
            newlyJoinedUsers.forEach( newUserId => {
                addChatMessage( {
                    type: 'system',
                    message: `User-${newUserId.substring( 0, 4 )} joined the chat`,
                    timestamp: createMessageTimestamp(),
                } );
            } );
        }

        // Show system message for users who left
        if ( usersWhoLeft.length > 0 ) {
            usersWhoLeft.forEach( leftUserId => {
                addChatMessage( {
                    type: 'system',
                    message: `User-${leftUserId.substring( 0, 4 )} left the chat`,
                    timestamp: createMessageTimestamp(),
                } );
            } );
        }
    };  // Initialize Pusher chat hook
    const { sendMessage, sendTypingStatus, isConnected, connectionInfo } = usePusherChat( {
        chatCode,
        userId,
        onUsersChange: handleUsersChange,
        onMessageReceived: handleMessageReceived,
        onTypingStatusUpdate: handleTypingStatusUpdate
    } );  // Sync connection status with Redux
    useEffect( () => {
        // Update basic connection state
        setConnectionStatus( isConnected );

        // Log detailed connection info for debugging
        console.log( "[Chat] Detailed connection info:", connectionInfo );

        // Track if there was any change in connection details
        const connectionChanged =
            prevConnectionStateRef.current !== connectionInfo.connectionState ||
            prevIsSubscribedRef.current !== connectionInfo.isFullySubscribed;

        // Update refs to track connection changes
        prevConnectionStateRef.current = connectionInfo.connectionState;
        prevIsSubscribedRef.current = connectionInfo.isFullySubscribed;

        // ConnectionHealth is calculated automatically in useChatState
        // based on connection state, messages, and user count
        // But we can force an update when the connection state changes
        if ( !isConnected ) {
            updateConnectionHealth( 'disconnected' );
        } else if ( connectionInfo.isFullySubscribed && connectionInfo.clientEventsSupported ) {
            // If we have full subscription and client events are working, connection is likely healthy
            updateConnectionHealth( 'healthy' );
            console.log( "[Chat] Connection fully established with all features" );
        } else if ( isConnected && connectionInfo.connectionState === 'connected' ) {
            // Connected but missing some features
            updateConnectionHealth( 'connected' );
        }

        // If connection details changed and we're fully connected, clear reconnect attempts
        if ( connectionChanged && isConnected && connectionInfo.isFullySubscribed ) {
            console.log( "[Chat] Connection fully established, resetting reconnect attempts" );
            reconnectAttemptsRef.current = 0;
        }
    }, [isConnected, connectionInfo, setConnectionStatus, updateConnectionHealth] );
    // Handle connection status changes and automatically retry when needed
    useEffect( () => {
        console.log( "[Chat] Connection status changed:", isConnected );

        // When connection is established, ensure users are updated
        if ( isConnected ) {
            // Display a system message when connection is established
            const hasConnectionMessage = messages.some(
                msg => msg.type === 'system' && msg.message.includes( 'Connected to chat' )
            );

            if ( !hasConnectionMessage ) {
                addChatMessage( {
                    type: 'system',
                    message: 'Connected to chat. Waiting for other participants...',
                    timestamp: createMessageTimestamp(),
                } );
            }
        }
    }, [isConnected, messages, addChatMessage] );  // Auto-reconnect mechanism with progressive backoff
    const reconnectTimerRef = useRef<NodeJS.Timeout | null>( null );

    useEffect( () => {
        // Reset attempt counter when connection is established
        if ( isConnected && connectionInfo.isFullySubscribed ) {
            reconnectAttemptsRef.current = 0;
            // If we have a successful connection, ensure the Redux connection state is synced
            setConnectionStatus( true );

            // Clear any existing reconnect timer
            if ( reconnectTimerRef.current ) {
                clearTimeout( reconnectTimerRef.current );
                reconnectTimerRef.current = null;
            }
        }

        // If not connected and no reconnect timer running, set one up
        if ( !isConnected && !reconnectTimerRef.current ) {
            // Use utility function to calculate optimal reconnect delay
            const reconnectDelay = calculateReconnectionDelay( reconnectAttemptsRef.current, 5000, 60000 );

            console.log( `[Chat] Setting reconnect timer for ${reconnectDelay / 1000}s (attempt ${reconnectAttemptsRef.current + 1})` );

            // Update Redux connection status immediately
            setConnectionStatus( false );

            reconnectTimerRef.current = setTimeout( () => {
                // Don't force page refresh immediately, just increment counter
                if ( !isConnected ) {
                    console.log( `[Chat] Still not connected after ${reconnectDelay / 1000}s` );
                    // Use utility function to decide if refresh is needed
                    if ( shouldRefreshPage( reconnectAttemptsRef.current, users.length ) ) {
                        // Before refresh, attempt to trigger a final reconnection
                        console.log( "[Chat] Critical connection failure, refreshing page..." );
                        window.location.reload();
                    } else {
                        // Just increase the attempt counter for next try
                        console.log( "[Chat] Reconnection attempt failed, will try again..." );
                        reconnectAttemptsRef.current += 1;
                    }
                }
                reconnectTimerRef.current = null;
            }, reconnectDelay );
        }

        // If connected, clear any pending reconnect timer
        if ( isConnected && reconnectTimerRef.current ) {
            clearTimeout( reconnectTimerRef.current );
            reconnectTimerRef.current = null;
        }

        // Cleanup function to clear any timers when component unmounts
        return () => {
            if ( reconnectTimerRef.current ) {
                clearTimeout( reconnectTimerRef.current );
                reconnectTimerRef.current = null;
            }
        };
    }, [isConnected, connectionInfo.isFullySubscribed, setConnectionStatus, users.length] );

    // Play notification sounds when new messages arrive
    useNotificationSound( messages, userId );

    useEffect( () => {
        messagesEndRef.current?.scrollIntoView( { behavior: "auto" } );
    }, [messages] );

    // Track if we already showed a reconnection message
    const [showedReconnectionMsg, setShowedReconnectionMsg] = useState( false );

    const handleSend = () => {
        if ( !input.trim() ) return;

        // Generate a unique message ID using nanoid
        const messageId = nanoid( 10 );

        const msg: ChatMessage = {
            type: "message",
            sender: userId,
            message: input,
            timestamp: createMessageTimestamp(),
            messageId
        };
        // Add the message to Redux store
        addChatMessage( { ...msg, isSent: true } );

        // Clear input field immediately for better UX
        setInput( "" );

        // Always try to send the message, even if our local state thinks we're disconnected
        // This is important because Pusher connection state might be slightly out of sync
        try {
            console.log( "[Chat] Attempting to send message..." );
            const success = sendMessage( msg );

            // If message was successfully sent, we can clear any reconnection messages
            if ( success ) {
                setShowedReconnectionMsg( false );
                return;
            }
        } catch ( err ) {
            console.error( "[Chat] Error sending message:", err );
        }
        // If we reach here, message sending failed
        if ( !showedReconnectionMsg ) {
            setShowedReconnectionMsg( true );

            // Add system message to Redux store
            addChatMessage( {
                type: 'system',
                message: 'Message queued. Trying to establish connection...',
                timestamp: createMessageTimestamp()
            } );

            // Try to reconnect without full page refresh
            console.log( "[Chat] Connection issue detected, attempting to reconnect..." );

            // Wait a bit for potential reconnection before considering a page reload
            setTimeout( () => {
                if ( !isConnected ) {
                    console.log( "[Chat] Still not connected, will try again..." );
                }
            }, 5000 );
        }    // Always try to clear typing status, even if our local connection state is false
        try {
            sendTypingStatusRef.current( false );
        } catch ( error ) {
            console.log( "[Chat] Failed to clear typing status:", error );
        }
    };
    // Track when the user is typing to send status updates
    // Use a ref to track previous input to avoid redundant typing status updates
    const prevInputRef = useRef( input );
    const prevIsConnectedRef = useRef( isConnected );
    // Create a stable ref for sendTypingStatus to avoid dependency issues
    const sendTypingStatusRef = useRef( sendTypingStatus );
    useEffect( () => {
        sendTypingStatusRef.current = sendTypingStatus;
    }, [sendTypingStatus] );
    // Reference for the typing timer
    const typingTimerRef = useRef<NodeJS.Timeout | null>( null );

    useEffect( () => {
        // Only proceed if connected
        if ( !isConnected ) return;

        // Clear any previous timer
        if ( typingTimerRef.current ) {
            clearTimeout( typingTimerRef.current );
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
        if ( ( wasTyping !== isTyping || connectionChanged ) && isConnected ) {
            sendTypingStatusRef.current( isTyping );
        } else if ( isTyping && isConnected ) {
            // For longer typing sessions, send an update every 3 seconds to keep status active
            typingTimerRef.current = setTimeout( () => {
                sendTypingStatusRef.current( true );
            }, 3000 );
        }

        // If typing, set a timer to clear typing status after inactivity
        if ( isTyping ) {
            const timer = setTimeout( () => {
                sendTypingStatusRef.current( false );
            }, 3500 );

            return () => {
                clearTimeout( timer );
                if ( typingTimerRef.current ) {
                    clearTimeout( typingTimerRef.current );
                }
            };
        }
    }, [input, isConnected] );
    return (
        <div className="flex flex-col h-screen w-full items-center">
            <div className="flex flex-col h-full w-full max-w-2xl">        <ChatRoomHeader
                userCount={users.length}
                chatCode={chatCode}
                isConnected={isConnected}
                connectionHealth={connectionHealth}
            />
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