// This service will handle image uploads when sending messages
import { UploadedFile } from '@/contexts/UploadedFilesContext';

// Server API endpoints for uploading files
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000';
const UPLOAD_ENDPOINT = `${SERVER_URL}/api/images/upload`;

/**
 * Get the current session ID for this chat
 * This could be the room ID or a user-specific session ID
 */
const getSessionId = () => {
  // Try to get room ID from URL if available
  const path = window.location.pathname;
  const matches = path.match( /\/chat\/([^\/]+)/ );

  if ( matches && matches[1] ) {
    return matches[1]; // Return the room ID
  }

  // If no room ID found, use a local session ID from localStorage
  let sessionId = localStorage.getItem( 'chat_session_id' );
  if ( !sessionId ) {
    // Generate a new session ID
    sessionId = `session_${Math.random().toString( 36 ).substring( 2, 15 )}`;
    localStorage.setItem( 'chat_session_id', sessionId );
  }

  return sessionId;
};

export const uploadImages = async ( files: UploadedFile[] ): Promise<string[]> => {
  if ( files.length === 0 ) return [];

  try {
    const sessionId = getSessionId();
    const formData = new FormData();
    files.forEach( fileObj => {
      formData.append( 'files', fileObj.file );
    } );

    const response = await fetch( `${UPLOAD_ENDPOINT}/${sessionId}`, {
      method: 'POST',
      body: formData,
    } );

    if ( !response.ok ) {
      throw new Error( `Failed to upload images: ${response.statusText}` );
    } const data = await response.json() as { fileUrls: Array<{ url: string }> };
    return data.fileUrls.map( file => file.url ) || [];
  } catch ( error ) {
    console.error( 'Error uploading files:', error );
    throw error;
  }
};

// Helper function to attach uploaded images to a message
export const attachImagesToMessage = ( message: string, imageUrls: string[] ): string => {
  if ( imageUrls.length === 0 ) return message;

  // You can customize this format based on how you want to store image references in messages
  const imageAttachments = imageUrls.map( url => `[image:${url}]` ).join( ' ' );
  return `${message} ${imageAttachments}`;
};
