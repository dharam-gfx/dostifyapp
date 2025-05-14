"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSocket from "@/hooks/useSocket";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";

const Page = () => {
  const searchParams = useSearchParams();
  // Get roomId from path or query
  const pathRoomId = typeof window !== "undefined"
    ? window.location.pathname.split("/").pop() || ""
    : "";
  const queryRoomId = searchParams.get("chatCode");
  const roomId = pathRoomId || queryRoomId || "";

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    sendMessage,
    isConnected,
    connectionError,
  } = useSocket(roomId);

  const [input, setInput] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && isConnected) {
      const sent = sendMessage(input);
      if (sent) setInput("");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader roomId={roomId} isConnected={isConnected} />
        <div className="flex-1 overflow-y-auto mb-30">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
          <ChatControls
            input={input}
            setInput={setInput}
            onSend={handleSend}
            isConnected={isConnected}
          />
        </div>

      </div>
    </div>
  );
};

export default Page;
