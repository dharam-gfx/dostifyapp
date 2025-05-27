import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareChatLinkProps {
    roomId?: string;
}

const ShareChatLink: React.FC<ShareChatLinkProps> = ( { roomId } ) => {
    // State to manage copied status and share URL
    const [copied, setCopied] = useState( false );
    // State to hold the share URL
    const [shareUrl, setShareUrl] = useState( '' );

    useEffect( () => {
        // Get the base URL dynamically
        const baseUrl = window.location.origin;
        setShareUrl( roomId ? `${baseUrl}/chat/${roomId}` : baseUrl );
    }, [roomId] );

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText( shareUrl );
            setCopied( true );
            toast.success( "Link copied to clipboard!" );

            // Reset copied state after 2 seconds
            setTimeout( () => {
                setCopied( false );
            }, 2000 );
        } catch {
            toast.error( "Failed to copy link" );
        }
    };

    const handleShare = async () => {
        if ( navigator.share ) {
            try {
                await navigator.share( {
                    title: 'Join my DostifyApp chat',
                    text: 'Click this link to join the private chat room:',
                    url: shareUrl,
                } );
                toast.success( "Thanks for sharing!" );
            } catch ( err ) {
                if ( ( err as Error ).name !== 'AbortError' ) {
                    toast.error( "Error sharing link" );
                }
            }
        } else {
            handleCopyLink();
        }
    };

    return (
        <div className="w-full space-y-4 p-4">
            <div className="flex flex-col space-y-2">
                <label htmlFor="share-link"
                    className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Share this link to invite others
                </label>
                <div className="flex space-x-2">
                    <Input
                        id="share-link"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyLink}
                        className="shrink-0"
                        title="Copy link"
                    >
                        {copied ?
                            <Check className="h-4 w-4 text-green-500" /> :
                            <Copy className="h-4 w-4" />
                        }
                    </Button>
                    <Button
                        variant="default"
                        size="icon"
                        onClick={handleShare}
                        className="shrink-0"
                        title="Share link"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Anyone with this link can join the chat room
            </p>
        </div>
    );
};

export default ShareChatLink;