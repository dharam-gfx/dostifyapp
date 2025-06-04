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
  };

  const handleDownload = ( e: React.MouseEvent ) => {
    e.stopPropagation(); // Prevent triggering the toggleFullImage

    // Create a temporary anchor element to trigger download
    const link = document.createElement( 'a' );
    link.href = attachment.url;

    // Extract filename from URL or use a default name
    const fileName = attachment.url.split( '/' ).pop() || 'image.jpg';
    link.download = attachment.name || fileName;

    document.body.appendChild( link );
    link.click();
    document.body.removeChild( link );
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
            className="absolute right-1 bottom-1 bg-rose-600 text-white rounded-full p-1 hover:bg-rose-700 shadow-md"
            title="Download image"
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
                  className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md"
                  onClick={( e ) => {
                    e.stopPropagation();
                    handleDownload( e );
                  }}
                  title="Download image"
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