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
    shouldFocusInput: boolean;
    setShouldFocusInput: (shouldFocus: boolean) => void;
    scrollToMessageId: string | null;
    setScrollToMessageId: (messageId: string | null) => void;
}

// Create the context with default values
const ReplyContext = createContext<ReplyContextType>({
    replyInfo: null,
    setReplyInfo: () => { },
    clearReply: () => { },
    shouldFocusInput: false,
    setShouldFocusInput: () => { },
    scrollToMessageId: null,
    setScrollToMessageId: () => { },
});

// Create a provider component
export const ReplyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [replyInfo, setReplyInfo] = useState<ReplyInfo | null>(null);
    const [shouldFocusInput, setShouldFocusInput] = useState<boolean>(false);
    const [scrollToMessageId, setScrollToMessageId] = useState<string | null>(null);

    const clearReply = () => setReplyInfo(null);    return (
        <ReplyContext.Provider value={{
            replyInfo,
            setReplyInfo,
            clearReply,
            shouldFocusInput,
            setShouldFocusInput,
            scrollToMessageId,
            setScrollToMessageId
        }}>
            {children}
        </ReplyContext.Provider>
    );
};

// Create a custom hook to use the reply context
export const useReply = () => useContext(ReplyContext);
