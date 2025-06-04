import fs from 'fs';
import path from 'path';
import { UPLOADS_BASE_DIR, SESSION_IMAGES_DIR } from './constants.js';

/**
 * Ensures that all required directories exist, creating them if needed
 */
export const ensureDirectoriesExist = () => {
  if ( !fs.existsSync( UPLOADS_BASE_DIR ) ) {
    fs.mkdirSync( UPLOADS_BASE_DIR, { recursive: true } );
  }
  if ( !fs.existsSync( SESSION_IMAGES_DIR ) ) {
    fs.mkdirSync( SESSION_IMAGES_DIR, { recursive: true } );
  }
};

/**
 * Ensures a session directory exists for a specific session ID
 * @param {string} sessionId - The ID of the session
 * @returns {string} - The path to the session directory
 */
export const ensureSessionDirectory = ( sessionId ) => {
  const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );
  if ( !fs.existsSync( sessionDir ) ) {
    fs.mkdirSync( sessionDir, { recursive: true } );
  }
  return sessionDir;
};

/**
 * Gets session directory stats
 * @param {string} sessionId - The ID of the session
 * @returns {fs.Stats | null} - File stats or null if directory doesn't exist
 */
export const getSessionDirectoryStats = ( sessionId ) => {
  const sessionDir = path.join( SESSION_IMAGES_DIR, sessionId );
  if ( fs.existsSync( sessionDir ) ) {
    return fs.statSync( sessionDir );
  }
  return null;
};

/**
 * Gets a list of all session directories
 * @returns {string[]} - Array of session IDs
 */
export const getAllSessionDirectories = () => {
  if ( !fs.existsSync( SESSION_IMAGES_DIR ) ) {
    return [];
  }
  return fs.readdirSync( SESSION_IMAGES_DIR );
};
