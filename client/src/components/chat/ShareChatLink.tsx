import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
        <div className="w-full space-y-6 p-4">
            {/* Share Link Section */}
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

            {/* How to Join Guide */}
            <div className="flex flex-col space-y-4">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    How to Join This Chat
                </h3>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                    <Image
                        src="/homeUI-image.png"
                        alt="How to join chat guidance"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <h4 className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Steps to Join:
                        </h4>
                        <ol className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1 list-decimal pl-4">
                            <li>Copy the link above using the copy button</li>
                            <li>Paste the link in the input field on the home page</li>
                            <li>Click the arrow button or press Enter to join the chat</li>
                        </ol>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        Note: Anyone with this link can join the chat room. Share responsibly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ShareChatLink;