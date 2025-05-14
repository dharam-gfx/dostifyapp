// pusherClient.ts - Singleton pattern for Pusher client

import PusherJS from "pusher-js";

/**
 * PusherClientManager - Singleton to manage a global Pusher instance
 * This helps prevent multiple instances being created across component remounts
 */
class PusherClientManager {
  private static instance: PusherClientManager;
  private pusherClient: PusherJS | null = null;
  private connectionCount = 0;
  private disconnectTimer: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Private constructor ensures singleton pattern
  }
  
  public static getInstance(): PusherClientManager {
    if (!PusherClientManager.instance) {
      PusherClientManager.instance = new PusherClientManager();
    }
    return PusherClientManager.instance;
  }
  
  /**
   * Get or create a Pusher client instance
   * @param userId The user ID for authentication
   * @returns A Pusher client instance
   */  public getClient(userId: string): PusherJS {
    // If we have a pending disconnect timer, cancel it
    if (this.disconnectTimer) {
      console.log("[PusherClient] Cancelling pending disconnect timer");
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    
    if (!this.pusherClient) {
      console.log("[PusherClient] Creating new Pusher instance");
      
      this.pusherClient = new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        authEndpoint: "/api/pusher/auth",
        auth: {
          params: { user_id: userId },
        },
        enabledTransports: ['ws', 'wss'],
        forceTLS: true,
      });
      
      this.addDebugListeners();
    } else {
      const connectionState = this.pusherClient.connection.state;
      console.log(`[PusherClient] Reusing existing Pusher instance (state: ${connectionState})`);
      
      // If the connection was in a closing or failed state, attempt to reconnect
      if (connectionState === 'disconnected' || connectionState === 'failed') {
        console.log("[PusherClient] Attempting to reconnect disconnected instance");
        this.pusherClient.connect();
      }
    }
    
    this.connectionCount++;
    console.log(`[PusherClient] Active connections: ${this.connectionCount}`);
    
    return this.pusherClient;
  }
  /**
   * Release a Pusher client instance
   * Disconnects when no more components are using it
   */  
  public releaseClient(): void {
    // Add a safeguard against going negative 
    if (this.connectionCount <= 0) {
      console.log("[PusherClient] Connection count already at 0, ignoring release");
      return;
    }
    
    this.connectionCount--;
    console.log(`[PusherClient] Active connections: ${this.connectionCount}`);
    
    // Only disconnect when no more components are using Pusher
    if (this.connectionCount === 0 && this.pusherClient) {
      console.log("[PusherClient] No more active connections, scheduling disconnect");
      
      // Clear any existing timer first
      if (this.disconnectTimer) {
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = null;
      }
      
      // Delay the disconnect with much longer timeout to avoid race conditions
      this.disconnectTimer = setTimeout(() => {
        // Double check connection count in case a new connection was made during the delay
        if (this.connectionCount > 0) {
          console.log("[PusherClient] New connections made during disconnect delay, aborting disconnect");
          return;
        }
        
        try {
          if (!this.pusherClient) return;
          
          const state = this.pusherClient.connection.state;
          console.log(`[PusherClient] Connection state before disconnect: ${state}`);
          
          if (state === "connected" || state === "connecting") {
            this.pusherClient.disconnect();
            console.log("[PusherClient] Disconnected successfully");
          }
          
          this.pusherClient = null;
        } catch (err) {
          console.error("[PusherClient] Error disconnecting:", err);
        } finally {
          this.disconnectTimer = null;
        }
      }, 5000); // Much longer timeout (5s) for more safety against rapid reconnects
    }
  }
  
  /**
   * Add debug listeners to the Pusher connection
   */  private addDebugListeners(): void {
    if (!this.pusherClient) return;
    
    this.pusherClient.connection.bind('connected', () => {
      console.log("[PusherClient] Connection established");
    });
    
    this.pusherClient.connection.bind('disconnected', () => {
      console.log("[PusherClient] Disconnected");
    });
      this.pusherClient.connection.bind('error', (err: Error) => {
      // Many Pusher errors are non-fatal and can be safely ignored
      if (err && typeof err === 'object' && 'data' in err) {
        const errorData = (err as unknown as { data: { code: number, message?: string } }).data;
        
        // Common error: 4301 - client events not enabled on free tier
        if (errorData && errorData.code === 4301) {
          console.log("[PusherClient] Client events not enabled on this account (expected for free tier)");
          return;
        }
        
        // Handle subscription timing errors
        if (errorData && errorData.message && 
            errorData.message.includes("not subscribed to channel")) {
          console.log("[PusherClient] Subscription not ready yet:", errorData.message);
          return;
        }
      }
      console.error("[PusherClient] Connection error:", err);
    });
    
    // Add additional listeners for connection state
    this.pusherClient.connection.bind('state_change', (states: { previous: string; current: string }) => {
      console.log(`[PusherClient] Connection state changed: ${states.previous} -> ${states.current}`);
    });
  }
}

// Export the singleton
export const pusherClientManager = PusherClientManager.getInstance();

// Export a convenience function for components
export function getPusherClient(userId: string): PusherJS {
  return pusherClientManager.getClient(userId);
}
