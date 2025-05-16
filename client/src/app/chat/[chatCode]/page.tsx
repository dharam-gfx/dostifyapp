"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { useSocket } from "@/hooks/useSocket";
import { useParams } from "next/navigation";
import { log } from "node:console";
const Page = () => {

  const [userName, setUserName] = useState( "dharam" );
  // Get roomId from the URL using Next.js useParams
  const params = useParams();
  const roomIdFromUrl = params?.chatCode as string || "";

  const [input, setInput] = useState( "hello" );
  const [roomId, setRoomId] = useState<string>( roomIdFromUrl );
  const messagesEndRef = useRef<HTMLDivElement | null>( null );


  const { userId, sendMessage, sendTyping, usersTyping, userEvents, users, isConnected, messages } = useSocket( roomId, userName );
  ;

  useEffect( () => {
    setRoomId( roomIdFromUrl );
    console.log( "Room ID from URL:", roomIdFromUrl );
  }, [roomIdFromUrl] );
  const handleSend = () => {
    // Check if input is empty or only contains whitespace
    if ( input.trim() === "" ) {
      return;
    }
    sendMessage( input );
    setInput( "" );
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader roomId={roomId} isConnected={isConnected} userCount={users.length} />
        <div className="flex-1 overflow-y-auto mb-35">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 mb-35 mx-auto w-full max-w-2xl">
          {(usersTyping.length > 0 && !usersTyping.includes(userId)) && (
            <div className="mb-2 px-4 animate-fade-in transition-all duration-300 ease-in-out">
              <TypingIndicator typingUsers={usersTyping} />
            </div>
          )}
          <ChatControls
            input={input}
            setInput={setInput}
            onSend={handleSend}
            sendTyping ={sendTyping}
            isConnected={isConnected} />
        </div>

      </div>
    </div>
  );
};

export default Page;
