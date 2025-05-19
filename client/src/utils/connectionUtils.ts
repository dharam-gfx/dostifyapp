/**
 * Connection utility functions for better chat connectivity management
 * Includes network connectivity tests, reconnection delay calculation, and connection health evaluation
 */

/**
 * Tests connectivity to the Pusher service
 * @returns Promise<boolean> True if connection test succeeded
 */
export async function testConnectionStatus(): Promise<boolean> {
  try {
    // We'll do a simple network check to see if we can reach Pusher's API
    await fetch('https://pusher.com/health', { 
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    // Since we're using no-cors mode, we won't actually get a status
    // But if the request doesn't throw an exception, the network is likely available
    return true;
  } catch (error) {
    console.error('[ConnectionUtils] Network connectivity test failed:', error);
    return false;
  }
}

/**
 * Calculate optimal reconnection delay based on attempt count
 * Uses exponential backoff with jitter to prevent thundering herd problem
 * @param attempt The current reconnection attempt count
 * @param minDelay Minimum delay in milliseconds (default: 1000)
 * @param maxDelay Maximum delay in milliseconds (default: 30000)
 * @returns The calculated delay in milliseconds
 */
export function calculateReconnectionDelay(
  attempt: number, 
  minDelay: number = 1000, 
  maxDelay: number = 30000
): number {
  if (attempt <= 0) return minDelay;
  
  // Calculate exponential backoff: min * 2^attempt
  const exponentialDelay = minDelay * Math.pow(2, Math.min(attempt, 6));
  
  // Add jitter (±20% randomness) to prevent all clients from reconnecting simultaneously
  const jitter = exponentialDelay * 0.2;
  const randomizedDelay = exponentialDelay - jitter + (Math.random() * jitter * 2);
  
  // Cap at the maximum delay
  return Math.min(randomizedDelay, maxDelay);
}

/**
 * Determines if the page should be refreshed based on reconnection attempts and user count
 * @param attempt The current reconnection attempt count
 * @param userCount The number of users in the chat
 * @returns True if the page should be refreshed, false otherwise
 */
export function shouldRefreshPage(attempt: number, userCount: number): boolean {
  // Only refresh if we've tried multiple times and have few or no users
  if (attempt >= 4 && userCount <= 1) {
    return true;
  }
  // For more users, be more conservative with refreshes
  if (attempt >= 6 && userCount <= 3) {
    return true;
  }
  return false;
}

/**
 * Evaluates the overall connection health based on connection status, messages received, and user count
 * @param isConnected Whether the client is connected
 * @param messagesReceived Number of messages received recently
 * @param userCount Number of users in the chat
 * @param lastMessageTime Optional timestamp of the last message
 * @returns Connection health status: 'healthy', 'connected', or 'disconnected'
 */
export function evaluateConnectionHealth(
  isConnected: boolean,
  messagesReceived: number,
  userCount: number,
  lastMessageTime?: number
): 'healthy' | 'connected' | 'disconnected' {
  // Not connected is easy
  if (!isConnected) return 'disconnected';
  
  // If we have multiple users and received messages, likely healthy
  const hasMultipleUsers = userCount > 1;
  const hasReceivedMessages = messagesReceived > 0;
  
  // Check if we've received a message recently (within last 3 minutes)
  const hasRecentMessage = lastMessageTime 
    ? (Date.now() - lastMessageTime) < 3 * 60 * 1000
    : false;
  
  if (hasMultipleUsers && (hasReceivedMessages || hasRecentMessage)) {
    return 'healthy';
  }
  
  return 'connected';
}
