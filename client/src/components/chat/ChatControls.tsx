// filepath: c:\Users\kdharmendra\Desktop\dostifyapp nextjs\dostifyapp\client\src\components\chat\ChatControls.tsx
import React, { useEffect, useRef, useState } from "react";
import { ChatControlsProps } from "@/types/components";
import { useReply } from "@/contexts/ReplyContext";
import ReplyBar from "./ReplyBar";

// Import refactored components
import { ChatInput, MediaButtons, ActionButtons, EmojiPickerContainer } from "./index";

const ChatControls: React.FC<ChatControlsProps> = ( {
  input,
  setInput,
  onSend,
  sendTyping,
  isConnected = true
} ) => {
  const { replyInfo, clearReply, shouldFocusInput, setShouldFocusInput } = useReply();
  const inputRef = useRef<HTMLTextAreaElement>( null );
  const pickerRef = useRef<HTMLDivElement>( null );
  const emojiButtonRef = useRef<HTMLButtonElement>( null );
  const [showEmojiPicker, setShowEmojiPicker] = useState( false );
  const [currentSkinTone, setCurrentSkinTone] = useState( 1 );

  // Close emoji picker when clicking outside
  useEffect( () => {
    const handleClickOutside = ( event: MouseEvent ) => {
      if (
        showEmojiPicker &&
        pickerRef.current &&
        !pickerRef.current.contains( event.target as Node ) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains( event.target as Node )
      ) {
        setShowEmojiPicker( false );
      }
    };

    document.addEventListener( "mousedown", handleClickOutside );
    return () => {
      document.removeEventListener( "mousedown", handleClickOutside );
    };
  }, [showEmojiPicker] );

  // Focus input when reply is clicked
  useEffect( () => {
    if ( shouldFocusInput && inputRef.current ) {
      inputRef.current.focus();
      // Reset the flag after focusing
      setShouldFocusInput( false );
    }
  }, [shouldFocusInput, setShouldFocusInput] );

  const handleSend = () => {
    if ( input.trim() === '' ) return;
    // Pass the actual input text to onSend and let onSend handle the reply info
    onSend( input );
    // Clear reply after sending
    clearReply();
    // Clear input field after sending
    setInput( '' );
  };

  // Handle emoji selection
  const handleEmojiSelect = ( emoji: { native: string } ) => {
    setInput( input + emoji.native );
    // Keep the picker open for multiple selections
    if ( inputRef.current ) {
      inputRef.current.focus();
    }
  };

  // Handle skin tone change
  const handleSkinToneChange = ( skin: number ) => {
    setCurrentSkinTone( skin );
  };

  // Toggle emoji picker visibility
  const toggleEmojiPicker = () => {
    setShowEmojiPicker( !showEmojiPicker );
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
      <div className="relative order-2 px-2 sm:px-0 pb-5 md:order-1">
        <div className="rounded-3xl border-input bg-card/80 relative z-10 border p-0 pb-2 shadow-xs backdrop-blur-xl">
          {/* Show reply bar if replying to a message */}
          {replyInfo && <ReplyBar />}

          {/* Chat Input */}
          <ChatInput
            inputRef={inputRef}
            input={input}
            setInput={setInput}
            sendTyping={sendTyping}
            handleSend={handleSend}
          />

          <div className="flex items-center gap-2 mt-2 w-full justify-between px-2">
            {/* Media Buttons (File Upload, Emoji, Image) */}
            <MediaButtons
              emojiButtonRef={emojiButtonRef}
              toggleEmojiPicker={toggleEmojiPicker}
            />

            {/* Action Buttons (Video, Mic, Send) */}
            <ActionButtons
              handleSend={handleSend}
              isInputEmpty={!input.trim()}
              isConnected={isConnected}
            />
          </div>

          {/* Emoji Picker */}
          <EmojiPickerContainer
            pickerRef={pickerRef}
            showEmojiPicker={showEmojiPicker}
            onEmojiSelect={handleEmojiSelect}
            currentSkinTone={currentSkinTone}
            onSkinToneChange={handleSkinToneChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatControls;
