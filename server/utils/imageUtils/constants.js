import path from 'path';

/**
 * Base directory for all uploaded files
 */
export const UPLOADS_BASE_DIR = path.join( process.cwd(), 'uploads' );

/**
 * Directory for session-specific image uploads
 */
export const SESSION_IMAGES_DIR = path.join( UPLOADS_BASE_DIR, 'sessions' );

/**
 * Maximum file size for uploads in bytes (10MB)
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Maximum number of files that can be uploaded at once
 */
export const MAX_FILES = 10;

/**
 * Default maximum age for inactive sessions in hours
 */
export const DEFAULT_MAX_AGE_HOURS = 24;
