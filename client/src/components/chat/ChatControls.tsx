import React from "react";
import { Paperclip, Smile, Image as LunarImage, Video, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatControlsProps } from "@/types/components";

let typingTimeout: NodeJS.Timeout | null = null;
const ChatControls: React.FC<ChatControlsProps> = ( { input, setInput, onSend, sendTyping, isConnected = true } ) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-2xl">
      <div className="relative order-2 px-2 sm:px-0 pb-5 md:order-1">
        <div className="rounded-3xl border-input bg-card/80 relative z-10 overflow-hidden border p-0 pb-2 shadow-xs backdrop-blur-xl">
          <textarea
            className={cn(
              "border-input placeholder:text-muted-foreground placeholder:text-sm focus-visible:border-ring focus-visible:ring-ring/50",
              "flex rounded-md border px-3 py-2 text-primary w-full resize-none border-none bg-transparent shadow-none outline-none",
              "focus-visible:ring-0 focus-visible:ring-offset-0 mt-2 ml-2 min-h-[44px] max-h-[150px] text-sm leading-[1.3]"
            )}
            rows={1}
            placeholder="Type your reply..."
            style={{ height: 44 }}
            value={input}
            onChange={e => {
              setInput( e.target.value );

              // Send typing immediately
              if ( e.target.value.length > 0 ) {
                sendTyping?.( true );
              } else {
                sendTyping?.( false );
              }

              // Clear previous timeout
              if ( typingTimeout ) {
                clearTimeout( typingTimeout );
              }

              // Set timeout to stop typing after 2s of inactivity
              typingTimeout = setTimeout( () => {
                sendTyping?.( false );
                typingTimeout = null;
              }, 2000 );
            }}
            onKeyDown={e => {
              if ( e.key === "Enter" && !e.shiftKey ) {
                e.preventDefault();
                onSend();
                sendTyping?.( false );

                // Clear typing timeout on send
                if ( typingTimeout ) {
                  clearTimeout( typingTimeout );
                  typingTimeout = null;
                }
              }
            }}
          />
          <div className="flex items-center gap-2 mt-2 w-full justify-between px-2">
            <div className="flex gap-2">
              {/* Attach Files */}
              <label>
                <input
                  className="hidden"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.md,.json,.csv,.xls,.xlsx"
                  type="file"
                  aria-hidden="true"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                  aria-label="Add files"
                >
                  <Paperclip className="size-4" />
                </Button>
              </label>
              {/* Emoji */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add Emoji"
              >
                <Smile className="size-4" />
              </Button>
              {/* GIF/Image */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Add GIF"
              >
                <LunarImage className="size-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              {/* Video */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Start video chat"
              >
                <Video className="size-4" />
              </Button>
              {/* Mic */}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 rounded-full border bg-transparent hover:bg-accent hover:text-accent-foreground"
                aria-label="Start recording"
              >
                <Mic className="size-4" />
              </Button>
              {/* Send */}              <Button
                type="button"
                size="icon"
                className="size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Send message"
                onClick={onSend}
                disabled={!input.trim() || !isConnected}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatControls;