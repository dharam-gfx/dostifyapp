import React from "react";
import { User } from "lucide-react";

export const SystemMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => (
  <div className="system-message text-center text-xs text-gray-500 my-3">
    {message}{' '}
    <span className="timestamp text-[10px] text-gray-400">{timestamp}</span>
  </div>
);

export const IncomingMessage: React.FC<{ message: string; timestamp: string, userName:string }> = ({ message, timestamp, userName }) => (
  <div className="flex mb-1">
    <div className="w-6 h-6 rounded-full flex items-center justify-center mr-1 bg-gray-200 relative">
      {/* Light mode circle */}
      <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
      <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
    </div>
    <div className="flex max-w-xs border rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line">
      <div className="w-full">
        <span className="text-rose-500">{userName}</span>
        <p className="text-xs pt-1 break-words whitespace-pre-line w-full">{message}</p>
        <span className="block text-[9px] text-gray-400 mt-0.5">{timestamp}</span>
      </div>
    </div>
  </div>
);

export const OutgoingMessage: React.FC<{ message: string; timestamp: string }> = ({ message, timestamp }) => (
  <div className="flex justify-end mb-1">
    <div className="flex max-w-xs bg-rose-500 text-white rounded-md p-2 gap-2 shadow text-xs break-words whitespace-pre-line">
      <div className="w-full">
        <span className="text-black">You</span>
        <p className="text-xs pt-1 break-words whitespace-pre-line w-full">{message}</p>
        <span className="block text-[9px] text-rose-200 mt-0.5">{timestamp}</span>
      </div>
    </div>
    <div className="w-6 h-6 rounded-full flex items-center justify-center ml-1 bg-gray-200 relative">
      {/* Light mode circle */}
      <span className="absolute inset-0 rounded-full border border-indigo-300 dark:border-transparent pointer-events-none"></span>
      <User className="h-4 w-4 text-gray-400 dark:text-gray-600 relative z-10" />
    </div>
  </div>
);
