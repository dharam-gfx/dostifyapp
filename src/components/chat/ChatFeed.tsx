"use client";
import { useEffect, type FC } from "react";
import { SystemMessage, IncomingMessage, OutgoingMessage } from "./MessageBubble";
import { ChatFeedProps } from "@/types/chat";

const ChatFeed: FC<ChatFeedProps> = ({ messages, messagesEndRef }) => {
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages, messagesEndRef]);

  return (
    <div className="h-screen overflow-y-auto p-2 pb-24 flex flex-col justify-end">
      <div>
        {messages.map((chat, index) =>
          chat.type === 'system' ? (
            <SystemMessage key={index} message={chat.message} timestamp={chat.timestamp} />
          ) : !chat.isSent ? (
            <IncomingMessage key={index} message={chat.message} timestamp={chat.timestamp} />
          ) : (
            <OutgoingMessage key={index} message={chat.message} timestamp={chat.timestamp} />
          )
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatFeed;