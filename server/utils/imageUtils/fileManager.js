import fs from 'fs';
import path from 'path';
import { SESSION_IMAGES_DIR } from './constants.js';

/**
 * Gets all files in a session directory
 * @param {string} sessionId - The ID of the session
 * @returns {string[]} - Array of filenames
 */
export const getSessionFiles = ( sessionId ) => {
  const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );
  if ( !fs.existsSync( sessionDir ) ) {
    return [];
  }
  return fs.readdirSync( sessionDir );
};

/**
 * Deletes a specific file in a session directory
 * @param {string} sessionId - The ID of the session
 * @param {string} filename - The name of the file to delete
 * @returns {boolean} - Whether the deletion was successful
 */
export const deleteSessionFile = ( sessionId, filename ) => {
  try {
    const filePath = path.join( SESSION_IMAGES_DIR, sessionId, filename );
    if ( fs.existsSync( filePath ) ) {
      fs.unlinkSync( filePath );
      return true;
    }
    return false;
  } catch ( error ) {
    console.warn( `Could not delete file ${filename} in session ${sessionId}:`, error );
    return false;
  }
};

/**
 * Generates a URL for an uploaded file
 * @param {string} serverUrl - The base server URL
 * @param {string} sessionId - The ID of the session
 * @param {string} filename - The name of the file
 * @returns {string} - The URL to access the file
 */
export const generateFileUrl = ( serverUrl, sessionId, filename ) => {
  return `${serverUrl}/images/sessions/${sessionId}/${filename}`;
};
