"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/strore";
import { useRouter, useParams } from "next/navigation";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { ReplyProvider, useReply } from "@/contexts/ReplyContext";
import { useSocket } from "@/hooks/useSocket";
import { useSocketNotificationSound } from "@/hooks/useSocketNotificationSound";
import { checkRoomExists } from "@/services/roomService";
import Loading from "@/app/loading";

// Internal component that uses the ReplyContext
const ChatRoom = () => {
  const userName = useSelector( ( state: RootState ) => state.user.userName ) || "User";
  const router = useRouter();
  const params = useParams();
  const { replyInfo, clearReply } = useReply();

  // State for loading and room existence
  const [isLoading, setIsLoading] = useState( true );
  const [roomExists, setRoomExists] = useState( false );

  // Memoize the room ID from URL
  const roomIdFromUrl = useMemo( () => params?.chatCode as string || "", [params] );

  const [input, setInput] = useState( "" );
  const [roomId, setRoomId] = useState<string>( roomIdFromUrl );
  const messagesEndRef = useRef<HTMLDivElement | null>( null );

  const { userId, sendMessage, sendTyping, usersTyping, users, isConnected, messages } = useSocket( roomId, userName );

  // Use the socket notification sound hook
  useSocketNotificationSound( messages, userId );

  const checkRoomExistsHandler = async ( roomIdFromUrl: string ) => {
    if ( roomIdFromUrl && roomIdFromUrl.trim() !== "" ) {
      try {
        setIsLoading( true );
        const data = await checkRoomExists( roomIdFromUrl );
        setRoomExists( data.exists );
      } catch ( error ) {
        console.error( "Error checking room:", error );
        setRoomExists( false );
      } finally {
        setIsLoading( false );
      }
    }
  };

  useEffect( () => {
    setRoomId( roomIdFromUrl );
    checkRoomExistsHandler( roomIdFromUrl );
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

  // Show loading screen
  if ( isLoading ) {
    return <Loading />;
  }

  // Show room not found screen
  if ( !roomExists ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-4 p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Chat Room Not Found
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            This chat room does not exist or has expired
          </p>
          <button
            onClick={() => router.push( "/" )}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-800 h-10 px-4 py-2 w-full"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <div className="fixed inset-x-0 top-0 z-10 mb-30 mx-auto w-full max-w-2xl">
          <ChatRoomHeader roomId={roomId} isConnected={isConnected} userCount={users.length} />
        </div>
        <div className="flex-1 overflow-y-auto mb-32 pb-11 mt-8 py-4">
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
