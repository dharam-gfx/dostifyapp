import React, { useEffect } from 'react';
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { init } from "emoji-mart";

interface EmojiPickerProps {
    onEmojiSelect: ( emoji: { native: string } ) => void;
    currentSkinTone: number;
    onSkinToneChange: ( skin: number ) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ( {
    onEmojiSelect,
    currentSkinTone,
    onSkinToneChange
} ) => {
    // Initialize emoji data
    useEffect( () => {
        init( { data } );
    }, [] );

    return (
        <Picker
            data={data}
            onEmojiSelect={onEmojiSelect}
            theme="auto"
            emojiSize={24}
            previewPosition="bottom"
            style={{ width: '100%' }}
            skinTone={currentSkinTone}
            onSkinToneChange={onSkinToneChange}
            categories={["frequent", "people", "nature", "foods", "activity", "places", "objects", "symbols", "flags"]}
            showSkinTonePicker={true}
            skinTonePosition="preview"
            maxFrequentRows={4}
        />
    );
};

export default EmojiPicker;
