import sessionManager from './sessionManager';

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';

class CleanupService {
  private static instance: CleanupService;

  private constructor() { }

  static getInstance(): CleanupService {
    if ( !CleanupService.instance ) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  async cleanupSessionImages( sessionId: string ): Promise<boolean> {
    try {
      const response = await fetch( `${SERVER_URL}/api/images/cleanup/${sessionId}`, {
        method: 'DELETE'
      } );

      if ( !response.ok ) {
        throw new Error( `Failed to cleanup session images: ${response.statusText}` );
      }

      return true;
    } catch ( error ) {
      console.error( 'Error cleaning up session images:', error );
      return false;
    }
  }

  async cleanupOnLeave(): Promise<void> {
    const session = sessionManager.getSessionInfo();
    if ( !session ) return;

    try {
      // Clean up images for this session
      await this.cleanupSessionImages( session.roomId );

      // Clear the session
      sessionManager.clearSession();
    } catch ( error ) {
      console.error( 'Error during cleanup on leave:', error );
    }
  }

  // Call this when window/tab is about to close
  registerCleanupHandlers(): void {
    window.addEventListener( 'beforeunload', () => {
      const session = sessionManager.getSessionInfo();
      if ( session ) {
        // Synchronous cleanup for page unload
        navigator.sendBeacon(
          `${SERVER_URL}/api/images/cleanup/${session.roomId}`
        );
      }
    } );
  }
}

export default CleanupService.getInstance();