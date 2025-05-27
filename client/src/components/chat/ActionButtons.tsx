import React from 'react';
import { Video, Mic, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
    handleSend: () => void;
    isInputEmpty: boolean;
    isConnected?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ( {
    handleSend,
    isInputEmpty,
    isConnected = true
} ) => {
    return (
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

            {/* Send */}
            <Button
                type="button"
                size="icon"
                className="size-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                aria-label="Send message"
                onClick={handleSend}
                disabled={isInputEmpty || !isConnected}
            >
                <Send className="size-4" />
            </Button>
        </div>
    );
};

export default ActionButtons;
