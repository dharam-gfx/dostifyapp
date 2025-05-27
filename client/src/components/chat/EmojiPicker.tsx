import React from 'react';
import EmojiPickerReact, { Theme, SkinTones, EmojiStyle } from 'emoji-picker-react';

interface EmojiPickerProps {
    onEmojiSelect: ( emoji: { native: string } ) => void;
    currentSkinTone: number;
    onSkinToneChange: ( skin: number ) => void;
}

const skinToneMap: { [key: number]: SkinTones } = {
    1: SkinTones.NEUTRAL,
    2: SkinTones.LIGHT,
    3: SkinTones.MEDIUM_LIGHT,
    4: SkinTones.MEDIUM,
    5: SkinTones.MEDIUM_DARK,
    6: SkinTones.DARK,
};

const EmojiPicker: React.FC<EmojiPickerProps> = ( {
    onEmojiSelect,
    currentSkinTone,
    onSkinToneChange
} ) => {
    const handleEmojiClick = ( emojiData: { emoji: string } ) => {
        // Convert emoji-picker-react format to your app's expected format
        onEmojiSelect( { native: emojiData.emoji } );
    };

    const handleSkinToneChange = ( skinTone: SkinTones ) => {
        // Map the skin tone value back to your app's expected format (1-6)
        const skinToneNumber = Object.keys( skinToneMap ).find(
            key => skinToneMap[parseInt( key )] === skinTone
        );
        onSkinToneChange( skinToneNumber ? parseInt( skinToneNumber ) : 1 );
    };

    return (
        <EmojiPickerReact
            onEmojiClick={handleEmojiClick}
            autoFocusSearch={true}
            theme={Theme.AUTO}
            searchPlaceholder="Search emoji"
            defaultSkinTone={skinToneMap[currentSkinTone] || SkinTones.NEUTRAL}
            onSkinToneChange={handleSkinToneChange}
            emojiStyle={EmojiStyle.APPLE}
            width="100%"
            height="350px"
            lazyLoadEmojis={true}
        />
    );
};

export default EmojiPicker;
