import React from 'react';
import { X } from 'lucide-react';
import { useUploadedFiles, UploadedFile } from '@/contexts/UploadedFilesContext';
import Image from 'next/image';

const UploadedImagesPreview: React.FC = () => {
  const { uploadedFiles, removeFile } = useUploadedFiles();

  if ( uploadedFiles.length === 0 ) {
    return null;
  }

  return (
    <div className="px-3 pt-2 overflow-x-auto">
      <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
        {uploadedFiles.map( ( file ) => (
          <ImagePreview key={file.id} file={file} onRemove={removeFile} />
        ) )}
      </div>
    </div>
  );
};

interface ImagePreviewProps {
  file: UploadedFile;
  onRemove: ( id: string ) => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ( { file, onRemove } ) => {
  return (
    <div className="relative group mt-1">
      <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 relative">
        <Image
          src={file.previewUrl}
          alt={file.file.name}
          fill
          sizes="64px"
          unoptimized={true}
          className="object-cover"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove( file.id )}
        className="absolute -top-1 -right-1 bg-rose-800 dark:bg-rose-700 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="size-3" />
      </button>
    </div>
  );
};

export default UploadedImagesPreview;
