
"use client";
import React, { useState, useRef, useEffect } from "react";

import ChatFeed from "@/components/chat/ChatFeed";
import ChatRoomHeader from "@/components/chat/ChatRoomHeader";
import ChatControls from "@/components/chat/ChatControls";

interface ChatMessage {
  type: 'system' | 'message';
  sender?: string;
  message: string;
  timestamp: string;
  isSent?: boolean;
}


const initialMessages: ChatMessage[] = [
  {
    type: 'system',
    message: 'Welcome to the chat!',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
  {
    type: 'message',
    sender: 'Alice',
    message: "Hey Bob, how's it going?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSent: false,
  },
  {
    type: 'message',
    sender: 'You',
    message: "Hi Alice! I'm good, just finished a great book. How about you?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSent: true,
  },
  {
    type: 'message',
    sender: 'Alice',
    message: "That book sounds interesting! What's it about?",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    isSent: false,
  },
];

const Page = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      {
        type: "message",
        sender: "You",
        message: input,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col h-full w-full max-w-2xl">
        <ChatRoomHeader />
        <div className="flex-1 overflow-y-auto mb-30">
          <ChatFeed messages={messages} messagesEndRef={messagesEndRef} />
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
          <ChatControls input={input} setInput={setInput} onSend={handleSend} />
        </div>
      </div>
    </div>
  );
};

export default Page;