import React, { useRef } from 'react';
import { Image as LunarImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadedFiles } from '@/contexts/UploadedFilesContext';
import { toast } from "sonner";

const FileUploadButton: React.FC = () => {
    const { addFiles } = useUploadedFiles();
    const inputRef = useRef<HTMLInputElement>( null );

    const handleFileChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
        if ( e.target.files && e.target.files.length > 0 ) {
            const files = Array.from( e.target.files );
            const MAX_SIZE = 2 * 1024 * 1024; // 2MB in bytes
            const MAX_FILES = 6; // Maximum 6 files allowed

            // Check if attempting to upload too many files
            if ( files.length > MAX_FILES ) {
                toast.error( `Too many files selected`, {
                    description: `Maximum ${MAX_FILES} files allowed. You selected ${files.length} files.`,
                    duration: 3000,
                    position: "top-center"
                } );
                return;
            }

            // Filter files that are too large
            const validFiles = files.filter( file => {
                if ( file.size > MAX_SIZE ) {
                    toast.error( `File too large: ${file.name}`, {
                        description: `Maximum allowed size is 2MB. This file is ${( file.size / ( 1024 * 1024 ) ).toFixed( 2 )}MB.`,
                        duration: 3000,
                        position: "top-center"
                    } );
                    return false;
                }
                return true;
            } );

            if ( validFiles.length > 0 ) {
                addFiles( validFiles );
                toast.success( `${validFiles.length} ${validFiles.length === 1 ? 'file' : 'files'} uploaded`, {
                    description: 'Files ready to be sent in the chat',
                    duration: 3000,
                    position: "top-center"
                } );
            }

            // Reset the input so the same file can be selected again
            if ( inputRef.current ) {
                inputRef.current.value = '';
            }
        }
    };

    const handleButtonClick = () => {
        // Programmatically trigger the file input when the button is clicked
        if ( inputRef.current ) {
            inputRef.current.click();
        }
    };

    return (
        <div className="relative">
            <input
                ref={inputRef}
                className="hidden"
                multiple
                accept="image/*"
                type="file"
                aria-hidden="true"
                onChange={handleFileChange}
            />
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add files"
                onClick={handleButtonClick}
            >
                <LunarImage className="size-4" />
            </Button>
        </div>
    );
};

export default FileUploadButton;
