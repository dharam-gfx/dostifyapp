"use client";

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/strore';
import { playSound } from '@/features/soundSlice';
import { ChatMessage } from '@/types/socket';

/**
 * Hook to automatically play notification sounds when socket messages are received
 * This version works with socket message types
 * @param messages The array of chat messages from socket
 * @param userId The current user's ID
 */
export function useSocketNotificationSound(
    messages: ChatMessage[],
    userId: string
) {
    const dispatch = useDispatch<AppDispatch>();
    const isSoundEnabled = useSelector( ( state: RootState ) => state.soundPreference.value );

    useEffect( () => {
        // Skip if there are no messages or sound is disabled
        if ( !messages.length || !isSoundEnabled ) return;

        // Get the last message
        const lastMessage = messages[messages.length - 1];

        // Only play notification for new incoming messages (not system messages or own messages)
        if (
            lastMessage.type === 'user' &&
            lastMessage.sender !== userId &&
            !lastMessage.isSent
        ) {
            dispatch( playSound() );
        }
    }, [messages, userId, isSoundEnabled, dispatch] );
}
