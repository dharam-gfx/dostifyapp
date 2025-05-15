"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";

const Page = () => {


  const [input, setInput] = useState("hello");
  const [roomId, setRoomId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]); // Replace 'any' with your message type
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]); // Array of typing user IDs
  const [userCount, setUserCount] = useState(4); // Number of users in the chat room
;

  const handleSend = () => {
    // Check if input is empty or only contains whitespace
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader roomId={roomId} isConnected={isConnected} userCount={userCount}/>
        <div className="flex-1 overflow-y-auto mb-35">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>

         <div className="fixed inset-x-0 bottom-0 z-40 mb-35 mx-auto w-full max-w-2xl">
                    {typingUsers.length > 0 && (
                        <div className="mb-2 px-4 animate-fade-in transition-all duration-300 ease-in-out">
                            <TypingIndicator typingUsers={typingUsers} />
                        </div>
                    )}
                    <ChatControls 
                    input={input}
            setInput={setInput}
            onSend={handleSend}
            isConnected={isConnected} />
                </div>

      </div>
    </div>
  );
};

export default Page;
