import fs from 'fs';
import path from 'path';

const SESSION_IMAGES_DIR = path.join( process.cwd(), 'uploads', 'sessions' );

/**
 * Cleans up image files associated with a specific session
 * @param {string} sessionId - The ID of the session to clean up
 */
export const cleanupSessionImages = async ( sessionId ) => {
  try {
    const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );

    if ( fs.existsSync( sessionDir ) ) {
      // Remove all files in the directory
      const files = fs.readdirSync( sessionDir );

      // Delete files with proper error handling for each file
      for ( const file of files ) {
        try {
          fs.unlinkSync( path.join( sessionDir, file ) );
        } catch ( fileError ) {
          console.warn( `Could not delete file ${file} in session ${sessionId}:`, fileError );
          // Continue with other files even if one fails
        }
      }

      // Remove the directory itself
      fs.rmdirSync( sessionDir );

      console.log( `Image cleanup for session ${sessionId} completed successfully` );
      return true;
    } else {
      console.log( `No images found for session ${sessionId}` );
      return true;
    }
  } catch ( error ) {
    console.error( `Failed to clean up images for session ${sessionId}:`, error );
    return false;
  }
};

/**
 * Remove unused session image directories that are older than a specified time
 * @param {number} [maxAgeHours=24] - Maximum age in hours before considering a session inactive
 */
export const cleanupInactiveSessions = ( maxAgeHours = 24 ) => {
  try {
    if ( !fs.existsSync( SESSION_IMAGES_DIR ) ) {
      return;
    }

    const currentTime = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds

    const sessions = fs.readdirSync( SESSION_IMAGES_DIR );

    for ( const session of sessions ) {
      const sessionDir = path.join( SESSION_IMAGES_DIR, session );
      const stats = fs.statSync( sessionDir );

      // Check if the directory is older than the max age
      if ( currentTime - stats.mtime.getTime() > maxAgeMs ) {
        cleanupSessionImages( session );
      }
    }
  } catch ( error ) {
    console.error( 'Error during inactive sessions cleanup:', error );
  }
};
