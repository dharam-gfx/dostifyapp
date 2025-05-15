"use client";

import { useEffect } from 'react';
import { useSound } from '@/providers/SoundProvider';
import { ChatMessage } from '@/types/chat';

/**
 * Hook to automatically play notification sounds when messages are received
 * @param messages The array of chat messages
 * @param userId The current user's ID
 */
export function useNotificationSound(
  messages: ChatMessage[],
  userId: string
) {
  const { playNotification } = useSound();
  
  useEffect(() => {
    // Skip if there are no messages
    if (!messages.length) return;
    
    // Get the last message
    const lastMessage = messages[messages.length - 1];
    
    // Only play notification for new incoming messages (not system messages or own messages)
    if (
      lastMessage.type === 'message' && 
      lastMessage.sender !== userId && 
      !lastMessage.isSent
    ) {
      playNotification();
    }
  }, [messages, userId, playNotification]);
}