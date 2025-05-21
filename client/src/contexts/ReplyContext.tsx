import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the reply information type
export interface ReplyInfo {
  messageId?: string;
  message: string;
  sender?: string;
}

// Define the context type
interface ReplyContextType {
  replyInfo: ReplyInfo | null;
  setReplyInfo: (info: ReplyInfo | null) => void;
  clearReply: () => void;
}

// Create the context with default values
const ReplyContext = createContext<ReplyContextType>({
  replyInfo: null,
  setReplyInfo: () => {},
  clearReply: () => {},
});

// Create a provider component
export const ReplyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [replyInfo, setReplyInfo] = useState<ReplyInfo | null>(null);

  const clearReply = () => setReplyInfo(null);

  return (
    <ReplyContext.Provider value={{ replyInfo, setReplyInfo, clearReply }}>
      {children}
    </ReplyContext.Provider>
  );
};

// Create a custom hook to use the reply context
export const useReply = () => useContext(ReplyContext);
