/**
 * Connection utility functions for better chat connectivity management
 * Includes network connectivity tests, reconnection delay calculation, and connection health evaluation
 */

/**
 * Tests connectivity to the server
 * @param serverUrl Optional URL to check, defaults to a general connectivity test
 * @returns Promise<boolean> True if connection test succeeded
 */
export async function testConnectionStatus(serverUrl?: string): Promise<boolean> {
  try {
    // Use provided server URL or a general connectivity test
    const testUrl = serverUrl || 'https://www.google.com'; // Fallback to a reliable site for connectivity check
    
    await fetch(testUrl, { 
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

/**
 * Gets the current network connection status of the device
 * @returns boolean Whether the device has an internet connection based on the browser API
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Adds event listeners to detect online/offline status changes
 * @param onOnline Callback for when the device comes online
 * @param onOffline Callback for when the device goes offline
 * @returns Function to remove the event listeners
 */
export function listenToConnectionChanges(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Creates a keep-alive mechanism to prevent socket connections from timing out
 * @param pingFn Function to call to keep the connection alive
 * @param interval Interval in milliseconds (default: 25s)
 * @returns Object with start and stop methods
 */
export function createKeepAlive(pingFn: () => void, interval = 25000) {
  let keepAliveId: number | null = null;
  
  return {
    start: () => {
      if (!keepAliveId) {
        keepAliveId = window.setInterval(() => {
          // Only send keep-alive if document is hidden (app in background)
          if (document.visibilityState === 'hidden') {
            pingFn();
          }
        }, interval);
      }
    },
    stop: () => {
      if (keepAliveId) {
        window.clearInterval(keepAliveId);
        keepAliveId = null;
      }
    }
  };
}

/**
 * Detects if the user is on a mobile device
 * @returns boolean True if the user is on a mobile device
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detects if the device/browser is likely to have background connection limitations
 * @returns boolean True if the device likely has connection restrictions when in background
 */
export function hasBackgroundConnectionLimitations(): boolean {
  const isMobile = isMobileDevice();
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  // Safari (especially on iOS) is most aggressive about throttling background connections
  return isMobile || isIOS || isSafari;
}

/**
 * Monitors page visibility changes and performs actions when visibility changes
 * @param onVisible Function to call when page becomes visible
 * @param onHidden Function to call when page is hidden
 * @returns Function to stop monitoring
 */
export function monitorPageVisibility(
  onVisible: () => void,
  onHidden: () => void
): () => void {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      onVisible();
    } else {
      onHidden();
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
