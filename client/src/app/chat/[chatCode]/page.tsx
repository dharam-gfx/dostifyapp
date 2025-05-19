"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";
import TypingIndicator from "@/components/ui/TypingIndicator";
import { useSocket } from "@/hooks/useSocket";
import { useParams } from "next/navigation";

const Page = () => {
  const [userName,] = useState("dharam");
  const params = useParams();
  
  // Memoize the room ID from URL
  const roomIdFromUrl = useMemo(() => params?.chatCode as string || "", [params]);

  const [input, setInput] = useState("");
  const [roomId, setRoomId] = useState<string>(roomIdFromUrl);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const { userId, sendMessage, sendTyping, usersTyping, users, isConnected, messages } = useSocket(roomId, userName);

  useEffect(() => {
    setRoomId(roomIdFromUrl);
    console.log("Room ID from URL:", roomIdFromUrl);
  }, [roomIdFromUrl]);

  // Memoize the typing indicator check
  const showTypingIndicator = useMemo(() => {
    return usersTyping.length > 0 && !usersTyping.includes(userId);
  }, [usersTyping, userId]);

  // Memoize the send handler
  const handleSend = useCallback(() => {
    if (input.trim() === "") {
      return;
    }
    sendMessage(input, userId);
    setInput("");
  }, [input, sendMessage, userId, setInput]);

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader roomId={roomId} isConnected={isConnected} userCount={users.length} />
        <div className="flex-1 overflow-y-auto mb-32 py-4">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 mb-30 mx-auto w-full max-w-2xl">
          {showTypingIndicator && (
            <div className="mb-2 px-4 animate-fade-in transition-all duration-300 ease-in-out">
              <TypingIndicator typingUsers={usersTyping} />
            </div>
          )}
          <ChatControls
            input={input}
            setInput={setInput}
            onSend={handleSend}
            sendTyping={sendTyping}
            isConnected={isConnected} 
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
