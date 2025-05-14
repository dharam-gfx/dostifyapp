"use client";

import { Button } from "@/components/ui/button";

import { ChevronRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

function Home() {
  const [chatCode, setChatCode] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatCode(e.target.value);
  };

  const handleJoinChat = () => {
    console.log("Joining chat with:", chatCode);
    if (chatCode.trim()) {
      router.push(`/chat/${chatCode}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        {/* Title and subtitle */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Dostify<span className="text-zinc-600 dark:text-zinc-400">App</span>
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            one-time end-to-end encrypted anonymous chats
          </p>
        </div>

        <div className="w-full space-y-6">
          {/* Label */}
          <div className="text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">Join private chat</p>
          </div>

          {/* Input + inside button */}
          <div className="relative w-full">
            <Input
              value={chatCode}
              onChange={handleInputChange}
              placeholder="Enter chat code or link to join..."
              className="h-11 pl-4 pr-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-600"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <Button
                size="icon"
                className="size-9 rounded-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-200"
                onClick={handleJoinChat}
                disabled={!chatCode.trim()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Or separator */}
          <div className="text-center">
            <p className="text-xs text-zinc-500 dark:text-zinc-500">or</p>
          </div>

          {/* Start new chat button */}
          <Button className="w-full h-11 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100">
            <ShieldCheck size={18} /> Start new private chat
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;