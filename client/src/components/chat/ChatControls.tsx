import React, { useEffect, useRef, useState } from "react";
import { ChatControlsProps } from "@/types/components";
import { useReply } from "@/contexts/ReplyContext";
import ReplyBar from "./ReplyBar";
import { UploadedFilesProvider, useUploadedFiles } from "@/contexts/UploadedFilesContext";
import UploadedImagesPreview from "./UploadedImagesPreview";
import { uploadImages, attachImagesToMessage } from "@/services/imageServices";

// Import refactored components
import { ChatInput, MediaButtons, ActionButtons, EmojiPickerContainer, AiReplySuggestions } from "./index";

// Type definition for AI suggestion state is used directly in useState below

const ChatControlsContent: React.FC<ChatControlsProps> = ( {
  input,
  setInput,
  onSend,
  sendTyping,
  isConnected = true,
  messages = [] // Recent messages for AI context
} ) => {
  const { replyInfo, clearReply, shouldFocusInput, setShouldFocusInput } = useReply();
  const { uploadedFiles, clearFiles } = useUploadedFiles();
  const inputRef = useRef<HTMLTextAreaElement>( null );
  const pickerRef = useRef<HTMLDivElement>( null );
  const emojiButtonRef = useRef<HTMLButtonElement>( null );
  const [showEmojiPicker, setShowEmojiPicker] = useState( false );
  const [currentSkinTone, setCurrentSkinTone] = useState( 1 );
  const [isUploading, setIsUploading] = useState( false );
  const [aiSuggestion, setAiSuggestion] = useState<{
    message: string;
    messageId?: string;
    visible: boolean;
  }>( {
    message: "",
    messageId: undefined,
    visible: false
  } );

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

  // Listen for AI reply requests from MessageActions
  useEffect( () => {
    const handleAiSuggestions = ( event: CustomEvent<{ message: string; messageId?: string }> ) => {
      const { message, messageId } = event.detail;
      setAiSuggestion( {
        message,
        messageId,
        visible: true
      } );
    };

    // Add event listener
    document.addEventListener( 'showAiSuggestions', handleAiSuggestions as EventListener );

    // Cleanup
    return () => {
      document.removeEventListener( 'showAiSuggestions', handleAiSuggestions as EventListener );
    };
  }, [] );

  const handleSend = async () => {
    if ( input.trim() === '' && uploadedFiles.length === 0 ) return;

    let finalMessage = input;

    try {
      // Check if there are uploaded files
      if ( uploadedFiles.length > 0 ) {
        setIsUploading( true );

        // Upload the images and get their URLs
        const imageUrls = await uploadImages( uploadedFiles );

        // Attach the image URLs to the message
        finalMessage = attachImagesToMessage( input, imageUrls );

        // Clear the uploaded files after sending
        clearFiles();
      }

      // Send the message with attached image URLs
      onSend( finalMessage );

      // Clear reply after sending
      clearReply();

      // Clear input field after sending
      setInput( '' );

    } catch ( error ) {
      console.error( 'Failed to send message with images:', error );
      // Handle upload error (show notification to user, etc.)
    } finally {
      setIsUploading( false );
    }
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

  // Handle selecting an AI suggestion
  const handleSelectSuggestion = ( suggestion: string ) => {
    setInput( suggestion );
    setAiSuggestion( prev => ( { ...prev, visible: false } ) );
    if ( inputRef.current ) {
      inputRef.current.focus();
    }
  };

  // Close AI suggestions
  const closeAiSuggestions = () => {
    setAiSuggestion( prev => ( { ...prev, visible: false } ) );
  };

  return (
    <div className="relative order-2 px-2 sm:px-0 pb-5 md:order-1">
      <div className="rounded-3xl border-input bg-card/80 relative z-10 border p-0 pb-2 shadow-xs backdrop-blur-xl">
        {/* Show AI reply suggestions when active */}
        {aiSuggestion.visible && (
          <div className="px-2 pt-2">
            <AiReplySuggestions
              message={aiSuggestion.message}
              conversationHistory={messages
                .map( msg => ( {
                  role: msg.isSent ? ( 'user' as const ) : ( 'assistant' as const ),
                  content: msg.message
                } ) )
                .slice( -5 )} // Only use the last 5 messages for context
              onSelectSuggestion={handleSelectSuggestion}
              onClose={closeAiSuggestions}
              visible={aiSuggestion.visible}
            />
          </div>
        )}

        {/* Show reply bar if replying to a message */}
        {replyInfo && <ReplyBar />}

        {/* Display uploaded images */}
        <UploadedImagesPreview />

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
          />            {/* Action Buttons (Video, Mic, Send) */}
          <ActionButtons
            handleSend={handleSend}
            isInputEmpty={!input.trim() && uploadedFiles.length === 0}
            isConnected={isConnected}
            isLoading={isUploading}
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
  );
};

const ChatControls: React.FC<ChatControlsProps> = ( props ) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
      <UploadedFilesProvider>
        <ChatControlsContent {...props} />
      </UploadedFilesProvider>
    </div>
  );
};

export default ChatControls;
