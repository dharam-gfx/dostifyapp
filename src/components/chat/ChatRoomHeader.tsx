import React from "react";
import { Lock, Users } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ChatRoomHeader = () => {
    return (
        <div className="flex w-full items-center justify-between py-4">
            <div className="flex-1 flex justify-center items-center gap-4">
                <div className="flex items-center space-x-8">
                    {/* Lock Icon with badge and tooltip */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center z-20 cursor-pointer">
                                    <div className="flex items-center text-xs text-muted-foreground">
                                        <Lock className="size-4" />
                                    </div>
                                    <span
                                        className="inline-flex items-center justify-center px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-sm m-0 text-muted-foreground hover:text-primary"
                                    >
                                        IuTirP
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Click to share this chat</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {/* Users Icon with count and tooltip */}
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