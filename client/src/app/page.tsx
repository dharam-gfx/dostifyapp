"use client";

import { Button } from "@/components/ui/button";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAlertSound } from '@/hooks/useAlertSound';
import { UserNameModal } from "@/components/ui/UserNameModal";
import { checkRoomExists, createNewChatRoomCode, createRoom } from "@/services/roomService";

function Home() {
  const [chatCode, setChatCode] = useState( "" );
  const router = useRouter();
  // Importing the alert sound hook
  const { playAlert } = useAlertSound();
  const handleInputChange = ( e: React.ChangeEvent<HTMLInputElement> ) => {
    // Store original input for display purposes
    const inputValue = e.target.value;
    const value = inputValue.trim();

    // If input is empty, clear the chat code
    if ( !value ) {
      setChatCode( "" );
      return;
    }

    // Check for direct chat code format (4-8 alphanumeric chars)
    if ( /^[a-zA-Z0-9]{4,8}$/.test( value ) ) {
      setChatCode( value.toLowerCase() );
      return;
    }

    // Try parsing as URL
    try {
      // Check if it might be a URL (contains '/' or '.')
      if ( value.includes( '/' ) || value.includes( '.' ) ) {
        // Add protocol if missing to make URL parsing work
        const urlString = value.startsWith( 'http' ) ? value : `https://${value}`;
        const url = new URL( urlString );

        // Check if path matches the expected pattern /chat/{code}
        const pathSegments = url.pathname.split( '/' ).filter( Boolean );
        if ( pathSegments[0] === 'chat' && pathSegments[1] ) {
          setChatCode( pathSegments[1].toLowerCase() );
          return;
        }

        // Also check for common URL shortening patterns like example.com/abcdef
        if ( pathSegments.length === 1 && pathSegments[0].length >= 4 && pathSegments[0].length <= 8 ) {
          setChatCode( pathSegments[0].toLowerCase() );
          return;
        }

        // Check hash-based routes (#/chat/code)
        if ( url.hash ) {
          const hashSegments = url.hash.substring( 1 ).split( '/' ).filter( Boolean );
          if ( hashSegments[0] === 'chat' && hashSegments[1] ) {
            setChatCode( hashSegments[1].toLowerCase() );
            return;
          }
        }

        // Check query parameters like ?room=code or ?chat=code
        const roomCode = url.searchParams.get( 'room' ) || url.searchParams.get( 'chat' );
        if ( roomCode && roomCode.length >= 4 && roomCode.length <= 8 ) {
          setChatCode( roomCode.toLowerCase() );
          return;
        }
      }
    } catch {
      // Not a valid URL, continue to use input as is
    }

    // If not a valid chat URL or extraction failed, use input as is
    // But make sure it's limited to a reasonable length to avoid potential issues
    setChatCode( value.slice( 0, 20 ).toLowerCase() );
  };
  const handleJoinChat = async () => {
    if ( chatCode.trim() ) {
      try {
        const data = await checkRoomExists( chatCode );

        if ( data.exists ) {
          router.push( `/chat/${chatCode}` );
        } else {
          // Play alert sound if the room doesn't exist
          playAlert();
          toast( `This chat room doesn't exist.`, {
            description: `Please check the code or create a new chat.`,
            action: {
              label: "New chat",
              onClick: () => handleStartNewChat(),
            },
          } );
        }
      } catch ( error ) {
        console.error( "Error checking room:", error );
        toast( `Error checking room.`, {
          description: `Please try again later.`,
        } );
      }
    }
  };
  
  const handleStartNewChat = async () => {
    try {
      const newChatCode = createNewChatRoomCode();
      console.log( "Starting new chat", newChatCode );

      // Create the room via API before navigating
      const result = await createRoom( newChatCode );

      if ( result.success ) {
        router.push( `/chat/${newChatCode}` );
      } else {
        playAlert();
        toast( `Error creating chat room.`, {
          description: `Please try again.`,
        } );
      }
    } catch ( error ) {
      console.error( "Error creating room:", error );
      playAlert();
      toast( `Error creating chat room.`, {
        description: `Please try again later.`,
      } );
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <UserNameModal />
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
              onKeyDown={( e ) => {
                if ( e.key === "Enter" ) {
                  handleJoinChat();
                }
              }}
              placeholder="Enter chat code or link to join..."
              className="h-11 pl-4 pr-12 rounded-full bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus-visible:ring-1 focus-visible:ring-zinc-600"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <Button
                title="Click join chat"
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
          <Button title="Click here to start new private chat" className="w-full h-11 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-zinc-900 dark:hover:bg-zinc-100"
            onClick={handleStartNewChat}
          >
            <ShieldCheck size={18} /> Start new private chat
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Home;