import { UploadedFile } from '@/contexts/UploadedFilesContext';
import { UPLOAD_ENDPOINT } from './constants';
import { getSessionId } from './sessionUtils';

/**
 * Uploads images to the server
 * @param files - Array of files to upload
 * @returns Array of URLs for the uploaded images
 */
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
    }

    const data = await response.json() as { fileUrls: Array<{ url: string }> };
    return data.fileUrls.map( file => file.url ) || [];
  } catch ( error ) {
    console.error( 'Error uploading files:', error );
    throw error;
  }
};

/**
 * Helper function to attach uploaded images to a message
 * @param message - The message text
 * @param imageUrls - Array of image URLs to attach
 * @returns Message text with image attachments
 */
export const attachImagesToMessage = ( message: string, imageUrls: string[] ): string => {
  if ( imageUrls.length === 0 ) return message;

  // Format for storing image references in messages
  const imageAttachments = imageUrls.map( url => `[image:${url}]` ).join( ' ' );
  return `${message} ${imageAttachments}`;
};
