import React, { RefObject } from 'react';
import EmojiPicker from './EmojiPicker';

interface EmojiPickerContainerProps {
    pickerRef: RefObject<HTMLDivElement | null>;
    showEmojiPicker: boolean;
    onEmojiSelect: ( emoji: { native: string } ) => void;
    currentSkinTone: number;
    onSkinToneChange: ( skin: number ) => void;
}

const EmojiPickerContainer: React.FC<EmojiPickerContainerProps> = ( {
    pickerRef,
    showEmojiPicker,
    onEmojiSelect,
    currentSkinTone,
    onSkinToneChange
} ) => {
    if ( !showEmojiPicker ) return null;

    return (
        <div
            ref={pickerRef}
            className="fixed bottom-23 left-3 z-[150]"
            onClick={( e ) => e.stopPropagation()}
            style={{ maxHeight: '68vh', overflowY: 'auto' }}
        >
            <EmojiPicker
                onEmojiSelect={onEmojiSelect}
                currentSkinTone={currentSkinTone}
                onSkinToneChange={onSkinToneChange}
            />
        </div>
    );
};

export default EmojiPickerContainer;
