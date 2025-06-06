import React, { useState } from 'react';
import { MessageAttachment } from '@/types/chat';
import { X, Download } from 'lucide-react';
import Image from 'next/image';

interface MessageAttachmentsProps {
  attachments: MessageAttachment[];
}

const MessageAttachments: React.FC<MessageAttachmentsProps> = ( { attachments } ) => {
  const imageAttachments = attachments.filter( att => att.type === 'image' );

  if ( imageAttachments.length === 0 ) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {imageAttachments.map( ( attachment, index ) => (
        <ImageAttachment key={`${attachment.url}-${index}`} attachment={attachment} />
      ) )}
    </div>
  );
};

interface ImageAttachmentProps {
  attachment: MessageAttachment;
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ( { attachment } ) => {
  const [showFullImage, setShowFullImage] = useState( false );

  const toggleFullImage = () => {
    setShowFullImage( !showFullImage );
  }; const [isDownloading, setIsDownloading] = useState( false );

  const handleDownload = ( e: React.MouseEvent ) => {
    e.stopPropagation(); // Prevent triggering the toggleFullImage

    // Don't allow multiple simultaneous downloads
    if ( isDownloading ) return;

    try {
      setIsDownloading( true );

      // Create a temporary anchor element to trigger download
      const link = document.createElement( 'a' );

      // Extract filename from URL or use a default name
      const fileName = attachment.url.split( '/' ).pop() || 'image.jpg';

      // For server images, use a fetch request with credentials if needed
      fetch( attachment.url, {
        method: 'GET',
        credentials: 'same-origin', // Include cookies for same-origin requests
        // For cross-origin requests, you may need to use 'include' if your server supports it
        // credentials: 'include', 
        headers: {
          // May be necessary for some server configurations
          'Cache-Control': 'no-cache',
        },
      } )
        .then( response => {
          if ( !response.ok ) {
            throw new Error( `HTTP error! Status: ${response.status}` );
          }
          return response.blob();
        } )
        .then( blob => {
          // Create a blob URL
          const blobUrl = URL.createObjectURL( blob );

          // Set up the download link
          link.href = blobUrl;
          link.download = attachment.name || fileName;

          // Trigger the download
          document.body.appendChild( link );
          link.click();

          // Clean up
          setTimeout( () => {
            document.body.removeChild( link );
            URL.revokeObjectURL( blobUrl );
            setIsDownloading( false );
          }, 100 );
        } )
        .catch( error => {
          console.error( 'Error downloading image:', error );
          alert( 'Failed to download image. Please try again.' );
          setIsDownloading( false );
        } );
    } catch ( error ) {
      console.error( 'Error initiating download:', error );
      alert( 'Failed to download image. Please try again.' );
      setIsDownloading( false );
    }
  };
  return (
    <>
      <div
        className="relative cursor-pointer rounded-md overflow-hidden group"
        onClick={toggleFullImage}
      >
        <div className="relative h-20 w-20">
          <Image
            src={attachment.url}
            alt="Attached image"
            fill
            sizes="80px"
            unoptimized={true}
            className="object-cover rounded-md"
          />
        </div>
        {/* Download button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className={`absolute right-1 bottom-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 shadow-md ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isDownloading ? "Downloading..." : "Download image"}
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>

      {showFullImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={toggleFullImage}
        >
          <div className="relative max-w-[90%] max-h-[90vh]">
            {/* Full image with Next.js Image */}
            <div className="relative" style={{ width: '80vw', height: '80vh', maxWidth: '1200px', maxHeight: '800px' }}>
              {/* Controls */}
              <div className="absolute top-2 right-2 z-10 flex gap-2">
                {/* Download button */}
                <button
                  className={`p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md ${isDownloading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={( e ) => {
                    e.stopPropagation();
                    handleDownload( e );
                  }}
                  disabled={isDownloading}
                  title={isDownloading ? "Downloading..." : "Download image"}
                >
                  <Download className="h-5 w-5" />
                </button>

                {/* Close button */}
                <button
                  className="p-1.5 rounded-full bg-gray-800/80 text-white hover:bg-gray-700"
                  onClick={( e ) => {
                    e.stopPropagation();
                    setShowFullImage( false );
                  }}
                  title="Close preview"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <Image
                src={attachment.url}
                alt="Full size image"
                fill
                unoptimized={true}
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageAttachments;