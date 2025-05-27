import React, { RefObject } from 'react';
import { Smile, Image as LunarImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import FileUploadButton from './FileUploadButton';

interface MediaButtonsProps {
    emojiButtonRef: RefObject<HTMLButtonElement | null>;
    toggleEmojiPicker: () => void;
}

const MediaButtons: React.FC<MediaButtonsProps> = ( {
    emojiButtonRef,
    toggleEmojiPicker
} ) => {
    return (
        <div className="flex gap-2">
            {/* File Upload Button */}
            <FileUploadButton />

            {/* Emoji */}
            <Button
                ref={emojiButtonRef}
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add Emoji"
                onClick={( e ) => {
                    e.stopPropagation();
                    toggleEmojiPicker();
                }}
            >
                <Smile className="size-4" />
            </Button>

            {/* GIF/Image */}
            <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add GIF"
            >
                <LunarImage className="size-4" />
            </Button>
        </div>
    );
};

export default MediaButtons;
