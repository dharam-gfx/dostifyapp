import React, { useEffect, useRef, useState } from "react";
import { ChatControlsProps } from "@/types/components";
import { useReply } from "@/contexts/ReplyContext";
import ReplyBar from "./ReplyBar";

// Import refactored components
import { ChatInput, MediaButtons, ActionButtons, EmojiPickerContainer, AiReplySuggestions } from "./index";

// Type definition for AI suggestion state is used directly in useState below

const ChatControls: React.FC<ChatControlsProps> = ( {
  input,
  setInput,
  onSend,
  sendTyping,
  isConnected = true,
  messages = [] // Recent messages for AI context
} ) => {
  const { replyInfo, clearReply, shouldFocusInput, setShouldFocusInput } = useReply();
  const inputRef = useRef<HTMLTextAreaElement>( null );
  const pickerRef = useRef<HTMLDivElement>( null );
  const emojiButtonRef = useRef<HTMLButtonElement>( null );
  const [showEmojiPicker, setShowEmojiPicker] = useState( false );
  const [currentSkinTone, setCurrentSkinTone] = useState( 1 );
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

  const handleSend = () => {
    if ( input.trim() === '' ) return;
    // Pass the actual input text to onSend and let onSend handle the reply info
    onSend( input );
    // Clear reply after sending
    clearReply();
    // Clear input field after sending
    setInput( '' );
    console.log( messages, " messages" );
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
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
      <div className="relative order-2 px-2 sm:px-0 pb-5 md:order-1">
        <div className="rounded-3xl border-input bg-card/80 relative z-10 border p-0 pb-2 shadow-xs backdrop-blur-xl">          {/* Show AI reply suggestions when active */}
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
