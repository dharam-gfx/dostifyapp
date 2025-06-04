import fs from 'fs';
import path from 'path';
import { SESSION_IMAGES_DIR, DEFAULT_MAX_AGE_HOURS } from './constants.js';
import { getSessionFiles } from './fileManager.js';
import { getAllSessionDirectories, getSessionDirectoryStats } from './dirManager.js';

/**
 * Cleans up image files associated with a specific session
 * @param {string} sessionId - The ID of the session to clean up
 * @returns {boolean} - Whether the cleanup was successful
 */
export const cleanupSessionImages = async ( sessionId ) => {
  try {
    const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );

    if ( fs.existsSync( sessionDir ) ) {
      // Remove all files in the directory
      const files = getSessionFiles( sessionId );

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
export const cleanupInactiveSessions = ( maxAgeHours = DEFAULT_MAX_AGE_HOURS ) => {
  try {
    if ( !fs.existsSync( SESSION_IMAGES_DIR ) ) {
      return;
    }

    const currentTime = Date.now();
    const maxAgeMs = maxAgeHours * 60 * 60 * 1000; // Convert hours to milliseconds

    const sessions = getAllSessionDirectories();

    for ( const session of sessions ) {
      const stats = getSessionDirectoryStats( session );

      if ( stats && currentTime - stats.mtime.getTime() > maxAgeMs ) {
        // Check if the directory is older than the max age
        cleanupSessionImages( session );
      }
    }
  } catch ( error ) {
    console.error( 'Error during inactive sessions cleanup:', error );
  }
};
