/**
 * Constants related to image handling
 */

// Server API endpoints for uploading files
export const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
export const UPLOAD_ENDPOINT = `${SERVER_URL}/api/images/upload`;
export const CLEANUP_ENDPOINT = `${SERVER_URL}/api/images/cleanup`;
export const LIST_ENDPOINT = `${SERVER_URL}/api/images/list`;
