"use client";
import { useEffect, useState, useRef, type FC, type RefObject } from "react";
import { SystemMessage, IncomingMessage, OutgoingMessage } from "./MessageComponents";
import { useReply } from "@/contexts/ReplyContext";

interface ChatMessage {
  type: string;
  sender?: string;
  message: string;
  timestamp: string;
  isSent?: boolean;
  messageId?: string;
  replyTo?: {
    messageId?: string;
    message: string;
    sender?: string;
  };
}

interface ChatFeedProps {
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

const ChatFeed: FC<ChatFeedProps> = ({ messages, messagesEndRef }) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);  const prevMessagesLengthRef = useRef(messages.length);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { scrollToMessageId, setScrollToMessageId } = useReply();  // Effect to handle scrolling to a specific message when ID changes
  useEffect(() => {
    if (scrollToMessageId && messageRefs.current[scrollToMessageId]) {
      // Scroll to the message with a highlight effect
      messageRefs.current[scrollToMessageId]?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a temporary highlight effect to the message bubble
      const messageEl = messageRefs.current[scrollToMessageId];
      if (messageEl) {
        // Find the actual message bubble element (it's the child element with the border and shadow)
        const messageBubble = messageEl.querySelector('.message-bubble');
        
        if (messageBubble) {
          // Add highlight class to the message bubble for border animation
          messageBubble.classList.add('message-highlight');
          
          // Remove the highlight class after animation completes
          setTimeout(() => {
            messageBubble.classList.remove('message-highlight');
          }, 3000);
        } else {
          // Fallback to the old behavior if we can't find the bubble
          messageEl.classList.add('message-highlight');
          setTimeout(() => {
            messageEl.classList.remove('message-highlight');
          }, 3000);
        }
      }
      
      // Reset the scroll ID after navigation, but with a delay to keep the highlight visible
      setTimeout(() => setScrollToMessageId(null), 3100);
    }
  }, [scrollToMessageId, setScrollToMessageId]);

  // Handle auto-scrolling and unread messages
  useEffect(() => {
    const currentLength = messages.length;
    const newMessages = currentLength - prevMessagesLengthRef.current;

    if (newMessages > 0 && !isNearBottom) {
      setUnreadCount((prev) => prev + newMessages);
    } else if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages, messagesEndRef, isNearBottom]);

  // Handle scroll events
  const handleScroll = () => {
    if (!chatContainerRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const scrollPosition = scrollHeight - scrollTop - clientHeight;

    // Check if user is near bottom (within 100px)
    const nearBottom = scrollPosition < 100;
    setIsNearBottom(nearBottom);
    setShowScrollButton(!nearBottom);

    // Clear unread counter when scrolled to bottom
    if (nearBottom && unreadCount > 0) {
      setUnreadCount(0);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  return (<div
    ref={chatContainerRef}
    onScroll={handleScroll}
    className="overflow-y-auto p-2 flex flex-col justify-end relative custom-scrollbar"
  >
    <div className="space-y-2">      {messages.map((chat, index) => {
        const isLatestMessage = index === messages.length - 1;
        const animationClass = isLatestMessage && isNearBottom ? "animate-fade-in-up" : "";
        
        // Create a ref callback to store references to message elements by messageId
        const setMessageRef = (element: HTMLDivElement | null) => {
          if (chat.messageId && element) {
            messageRefs.current[chat.messageId] = element;
          }
        };        return (
          <div 
            key={index} 
            ref={setMessageRef}
            className={`transition-all duration-300 ${animationClass}`}
          >
            {chat.type === 'system' ? (
              <SystemMessage message={chat.message} timestamp={chat.timestamp} />
            ) : !chat.isSent ? (
              <IncomingMessage
                message={chat.message}
                timestamp={chat.timestamp}
                userName={chat.sender ?? "User"}
                messageId={chat.messageId}
                replyTo={chat.replyTo}
              />
            ) : (
              <OutgoingMessage
                message={chat.message}
                timestamp={chat.timestamp}
                messageId={chat.messageId}
                replyTo={chat.replyTo}
              />
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
    {/* Scroll to bottom button with animation */}
    <div className={`fixed bottom-28 right-4 z-50 transition-all duration-300 transform 
    ${showScrollButton ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
      <button
        onClick={scrollToBottom}
        className="bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/80 flex items-center justify-center hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
        aria-label="Scroll to bottom"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  </div>
  );
};

export default ChatFeed;