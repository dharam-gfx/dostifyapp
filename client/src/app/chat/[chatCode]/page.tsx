"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/strore";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { ReplyProvider, useReply } from "@/contexts/ReplyContext";
import { useSocket } from "@/hooks/useSocket";
import { useSocketNotificationSound } from "@/hooks/useSocketNotificationSound";
import { useParams } from "next/navigation";

// Internal component that uses the ReplyContext
const ChatRoom = () => {
  // Get userName from Redux store, fallback to "User" if not available
  const userName = useSelector( ( state: RootState ) => state.user.userName ) || "User";
  const params = useParams();
  const { replyInfo, clearReply } = useReply();

  // Memoize the room ID from URL
  const roomIdFromUrl = useMemo( () => params?.chatCode as string || "", [params] );

  const [input, setInput] = useState( "" );
  const [roomId, setRoomId] = useState<string>( roomIdFromUrl );
  const messagesEndRef = useRef<HTMLDivElement | null>( null );

  const { userId, sendMessage, sendTyping, usersTyping, users, isConnected, messages } = useSocket( roomId, userName );

  // Use the socket notification sound hook
  useSocketNotificationSound( messages, userId );

  useEffect( () => {
    setRoomId( roomIdFromUrl );
    console.log( "Room ID from URL:", roomIdFromUrl );
  }, [roomIdFromUrl] );

  // Memoize the typing indicator check
  const showTypingIndicator = useMemo( () => {
    return usersTyping.length > 0 && !usersTyping.includes( userId );
  }, [usersTyping, userId] );  // Handle sending a message with reply data
  const handleSendWithReply = ( content?: string ) => {
    if ( !content || content.trim() === "" ) return;

    // Only pass replyInfo if it exists, otherwise pass undefined
    const replyData = replyInfo ? {
      message: replyInfo.message,
      sender: replyInfo.sender,
      messageId: replyInfo.messageId
    } : undefined;

    sendMessage( content, userId, replyData );
    clearReply(); // Clear the reply after sending
    setInput( "" ); // Clear the input field after sending
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <div className="fixed inset-x-0 top-0 z-10 mb-30 mx-auto w-full max-w-2xl">
          <ChatRoomHeader roomId={roomId} isConnected={isConnected} userCount={users.length} />
        </div>
        <div className="flex-1 overflow-y-auto mb-32 mt-8 py-4">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>

        <div className="fixed inset-x-0 bottom-0 mb-30 mx-auto w-full max-w-2xl">
          {showTypingIndicator && (
            <div className="mb-2 px-4 animate-fade-in transition-all duration-300 ease-in-out">
              <TypingIndicator typingUsers={usersTyping} />
            </div>
          )}
          <ChatControls
            input={input}
            setInput={setInput}
            onSend={handleSendWithReply}
            sendTyping={sendTyping}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  );
};

// Main page component that provides ReplyContext
const Page = () => {
  return (
    <ReplyProvider>
      <ChatRoom />
    </ReplyProvider>
  );
};

export default Page;
