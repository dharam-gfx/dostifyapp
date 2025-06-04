import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface UploadedFilesContextType {
  uploadedFiles: UploadedFile[];
  addFiles: ( files: File[] ) => void;
  removeFile: ( id: string ) => void;
  clearFiles: () => void;
}

const UploadedFilesContext = createContext<UploadedFilesContextType | undefined>( undefined );

export const UploadedFilesProvider: React.FC<{ children: ReactNode }> = ( { children } ) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>( [] );

  const addFiles = ( files: File[] ) => {
    const newFiles = Array.from( files )
      .filter( file => file.type.startsWith( 'image/' ) )
      .map( file => ( {
        id: `${file.name}-${Date.now()}-${Math.random().toString( 36 ).substr( 2, 9 )}`,
        file,
        previewUrl: URL.createObjectURL( file )
      } ) );

    setUploadedFiles( prev => [...prev, ...newFiles] );
  };

  const removeFile = ( id: string ) => {
    setUploadedFiles( prev => {
      // Find and revoke object URL to prevent memory leaks
      const fileToRemove = prev.find( file => file.id === id );
      if ( fileToRemove ) {
        URL.revokeObjectURL( fileToRemove.previewUrl );
      }

      return prev.filter( file => file.id !== id );
    } );
  };

  const clearFiles = () => {
    // Revoke all object URLs to prevent memory leaks
    uploadedFiles.forEach( file => {
      URL.revokeObjectURL( file.previewUrl );
    } );
    setUploadedFiles( [] );
  };
  // Clean up object URLs when component unmounts
  React.useEffect( () => {
    return () => {
      uploadedFiles.forEach( file => {
        URL.revokeObjectURL( file.previewUrl );
      } );
    };
  }, [uploadedFiles] );

  return (
    <UploadedFilesContext.Provider value={{ uploadedFiles, addFiles, removeFile, clearFiles }}>
      {children}
    </UploadedFilesContext.Provider>
  );
};

export const useUploadedFiles = () => {
  const context = useContext( UploadedFilesContext );
  if ( context === undefined ) {
    throw new Error( 'useUploadedFiles must be used within a UploadedFilesProvider' );
  }
  return context;
};
