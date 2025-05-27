import React from "react";
import { Lock, Users, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useChatState } from "@/hooks/useChatState";
import { ChatRoomHeaderProps } from "@/types/components";
import ChatRoomHeaderModal from "./ChatRoomHeaderModal";

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ( { roomId, isConnected, userCount } ) => {
    const { deliveryWorking } = useChatState();
    return (
        <div className="flex w-full items-center justify-between py-4 backdrop-blur-md bg-background/80">
            <div className="flex-1 flex justify-center items-center gap-4">
                <div className="flex items-center space-x-2">

                    {isConnected ? (
                        deliveryWorking ? (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-xs text-green-500 z-20 cursor-pointer">
                                            <Wifi className="size-4 mr-1 text-green-500" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>Fully connected. Messages are being delivered.</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ) : (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center text-xs text-orange-500 z-20 cursor-pointer">
                                            <Wifi className="size-4 mr-1 text-orange-500 animate-pulse" />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <span>Connected, but message delivery may be delayed or not working.</span>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-xs text-rose-500 z-20 cursor-pointer">
                                        <WifiOff className="size-4 mr-1 text-rose-500 animate-pulse" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <span>Establishing connection to chat</span>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    {/* Lock Icon with badge and tooltip */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center z-20 cursor-pointer">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Lock className="size-4" />
                                    </div>
                                    {/* Chat room modal */}
                                    <ChatRoomHeaderModal roomId={roomId || 'XXXXXX'} />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Click to share this chat</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>



                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center text-xs text-muted-foreground z-20 cursor-pointer">
                                    <Users className="size-4 mr-2" />
                                    <span className="text-sm">{userCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Group members</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export default ChatRoomHeader;