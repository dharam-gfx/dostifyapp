import sessionManager from '../sessionManager';
import { CLEANUP_ENDPOINT } from './constants';

/**
 * Service for cleaning up image files on the server
 */
class CleanupService {
  private static instance: CleanupService;

  private constructor() { }

  static getInstance(): CleanupService {
    if ( !CleanupService.instance ) {
      CleanupService.instance = new CleanupService();
    }
    return CleanupService.instance;
  }

  /**
   * Cleans up images for a specific session
   * @param sessionId - The session ID to clean up
   * @returns Whether the cleanup was successful
   */
  async cleanupSessionImages( sessionId: string ): Promise<boolean> {
    try {
      const response = await fetch( `${CLEANUP_ENDPOINT}/${sessionId}`, {
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

  /**
   * Cleans up images when leaving a chat room
   */
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

  /**
   * Registers event handlers for cleanup on page unload
   */
  registerCleanupHandlers(): void {
    window.addEventListener( 'beforeunload', () => {
      const session = sessionManager.getSessionInfo();
      if ( session ) {
        // Synchronous cleanup for page unload
        navigator.sendBeacon(
          `${CLEANUP_ENDPOINT}/${session.roomId}`
        );
      }
    } );
  }
}

export default CleanupService.getInstance();
