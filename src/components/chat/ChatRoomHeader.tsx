import React from "react";
import { Lock, Users, Wifi, WifiOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatRoomHeaderProps } from "@/types/chat";

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({ 
    userCount = 1, 
    chatCode = "Chat",
    isConnected = false,
    connectionHealth = 'disconnected'
}) => {    // Determine connection status icon and text with more detail
    const getConnectionStatus = () => {
        if (connectionHealth === 'healthy') {
            return {
                icon: <Wifi className="size-4 mr-1 text-green-500" />,
                text: `Connected (${userCount} ${userCount === 1 ? 'user' : 'users'})`,
                className: 'text-green-500',
                tooltip: 'Fully connected to chat with verified two-way communication'
            };
        } else if (connectionHealth === 'connected') {
            return {
                icon: <Wifi className="size-4 mr-1 text-yellow-500" />,
                text: `Connected (${userCount} ${userCount === 1 ? 'user' : 'users'})`,
                className: 'text-yellow-500',
                tooltip: 'Connected but waiting for message confirmation'
            };
        } else if (isConnected) {
            // This case handles when isConnected is true but connectionHealth is 'disconnected'
            // which should not normally happen but provides a fallback
            return {
                icon: <Wifi className="size-4 mr-1 text-yellow-500 animate-pulse" />,
                text: `Connecting... (${userCount} ${userCount === 1 ? 'user' : 'users'})`,
                className: 'text-yellow-500',
                tooltip: 'Connection established but not fully initialized'
            };
        } else {
            return {
                icon: <WifiOff className="size-4 mr-1 text-rose-500 animate-pulse" />,
                text: 'Connecting...',
                className: 'text-rose-500',
                tooltip: 'Establishing connection to chat'
            };
        }
    };
    
    const connectionStatus = getConnectionStatus();
    
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
                                        {chatCode}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>Click to share this chat</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {/* Connection status */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center text-xs z-20 cursor-pointer">
                                    {connectionStatus.icon}
                                    <span className={`text-xs ${connectionStatus.className}`}>
                                        {connectionStatus.text}
                                    </span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>{connectionStatus.tooltip}</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    
                    {/* Users Icon with count and tooltip */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center text-xs text-muted-foreground z-20 cursor-pointer">
                                    <Users className="size-4 mr-1" />
                                    <span>{userCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <span>{userCount} {userCount === 1 ? 'user' : 'users'} in chat</span>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
};

export default ChatRoomHeader;