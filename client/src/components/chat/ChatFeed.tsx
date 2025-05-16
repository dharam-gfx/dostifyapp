"use client";
import { useEffect, type FC, type RefObject } from "react";
import { SystemMessage, IncomingMessage, OutgoingMessage } from "./MessageBubble";

interface ChatMessage {
  type: string;
  sender?: string;
  message: string;
  timestamp: string;
  isSent?: boolean;
}

interface ChatFeedProps {
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

const ChatFeed: FC<ChatFeedProps> = ({ messages, messagesEndRef }) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, messagesEndRef]);

  return (
    <div className="h-screen overflow-y-auto p-2 pb-24 flex flex-col justify-end">
      <div>
        {messages.map((chat, index) =>
          chat.type === 'system' ? (
            <SystemMessage key={index} message={chat.message} timestamp={chat.timestamp}  />
          ) : !chat.isSent ? (
            <IncomingMessage key={index} message={chat.message} timestamp={chat.timestamp} userName={chat.sender ?? "User"} />
          ) : (
            <OutgoingMessage key={index} message={chat.message} timestamp={chat.timestamp}  />
          )
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatFeed;