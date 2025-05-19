/**
 * Utilities for message handling and delivery monitoring
 */
import { ChatMessage } from "@/types/chat";

/**
 * Calculate the average time between receiving messages
 * This can be used to determine if messages are flowing normally
 * 
 * @param messages Array of received messages (not sent by the current user)
 * @param windowSize Number of recent messages to consider (default: 5)
 * @returns Average time in milliseconds between messages, or null if not enough messages
 */
export function calculateMessageReceiptInterval(
  messages: ChatMessage[],
  currentUserId: string,
  windowSize: number = 5
): number | null {
  // Filter to only messages received from others
  const receivedMessages = messages.filter(
    msg => msg.type === 'message' && msg.sender !== currentUserId
  );

  if ( receivedMessages.length < windowSize + 1 ) {
    return null;  // Not enough messages to calculate
  }

  // Take the most recent messages according to windowSize
  const recentMessages = receivedMessages.slice( -windowSize - 1 );

  // Calculate time differences between consecutive messages
  let totalTimeDiff = 0;
  let count = 0;

  for ( let i = 1; i < recentMessages.length; i++ ) {
    const current = new Date( recentMessages[i].timestamp ).getTime();
    const previous = new Date( recentMessages[i - 1].timestamp ).getTime();

    // Skip invalid timestamps
    if ( isNaN( current ) || isNaN( previous ) ) continue;

    totalTimeDiff += ( current - previous );
    count++;
  }

  // Return average or null if no valid time differences
  return count > 0 ? totalTimeDiff / count : null;
}

/**
 * Check if message delivery seems to be working properly
 * 
 * @param messages All messages in the chat
 * @param currentUserId The current user's ID
 * @param timeWindow Time window in milliseconds to check (default: 3 minutes)
 * @returns Boolean indicating if message delivery appears to be working
 */
export function isMessageDeliveryWorking(
  messages: ChatMessage[],
  currentUserId: string,
  timeWindow: number = 3 * 60 * 1000  // Default: last 3 minutes
): boolean {
  // If there are no messages, we can't tell
  if ( messages.length === 0 ) return true;

  const now = Date.now();
  const recentMessages = messages.filter( msg => {
    const msgTime = new Date( msg.timestamp ).getTime();
    return !isNaN( msgTime ) && ( now - msgTime ) < timeWindow;
  } );

  // Check if we've sent any messages in the time window
  const sentMessages = recentMessages.filter(
    msg => msg.sender === currentUserId && msg.type === 'message'
  );

  // Check if we've received any messages in the time window
  const receivedMessages = recentMessages.filter(
    msg => msg.sender !== currentUserId && msg.type === 'message'
  );

  // If we've sent messages but received none in response, delivery might be broken
  // But only if there are other users who might respond
  if ( sentMessages.length > 2 && receivedMessages.length === 0 ) {
    return false;
  }

  return true;
}
