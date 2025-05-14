import React from "react";
import { Lock, Users, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatRoomHeaderProps {
    roomId?: string;
    isConnected?: boolean;
}

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ( { roomId = "xxxxx", isConnected } ) => {
    return (
        <div className="flex w-full items-center justify-between py-4">
            <div className="flex-1 flex justify-center items-center gap-4">
                <div className="flex items-center space-x-2">

                    {isConnected ? (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-xs text-green-500 z-20 cursor-pointer">
                                        <Wifi className="size-4 mr-1 text-green-500 animate-pulse" />
                                        {/* <span className="text-sm">Connected </span> */}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <span>Fully connected</span>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    ) : (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center text-xs text-rose-500 z-20 cursor-pointer">
                                        <WifiOff className="size-4 mr-1 text-rose-500 animate-pulse" />
                                        {/* <span className="text-sm">Connecting</span> */}
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

                                    <span
                                        className="inline-flex items-center justify-center px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-sm m-0 text-muted-foreground hover:text-primary" >
                                        {roomId || "xxxxx"}
                                    </span>
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
                                    <span className="text-sm">1</span>
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