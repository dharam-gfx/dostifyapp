import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobeLock, Link2 } from "lucide-react";
import Privacy from '@/components/privacy/Privacy';

import { Modal } from '@/components/ui/Modal';
import { TabItem } from "@/types/components";
import ShareChatLink from "./ShareChatLink";

const tabs: TabItem[] = [
    {
        name: "Share Link",
        value: "Share Link",
        icon: Link2,
        content: ShareChatLink,
    },
    {
        name: "Privacy",
        value: "privacy",
        className: "h-[400px] overflow-y-auto",
        icon: GlobeLock,
        content: Privacy,
    },
];

interface ChatRoomHeaderModalProps {
    roomId: string;
}

const ChatRoomHeaderModal = ( { roomId }: ChatRoomHeaderModalProps ) => {
    return (
        <>
            <Modal title="Share Chat Room" description="Share this chat room with others">
                <div className=''>
                    <span
                        className="inline-flex items-center justify-center px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 text-sm m-0 text-muted-foreground hover:text-primary" >
                        {roomId || "xxxxxx"}
                    </span>
                </div>
                <div className='h-[350px] overflow-hidden'>
                    <Tabs
                        orientation="vertical"
                        defaultValue={tabs[0].value}
                        className="max-w-md w-full flex items-start gap-4 flex-row justify-center"
                    >
                        <TabsList className="shrink-0 grid grid-cols-1 gap-1 p-0 bg-background">
                            {tabs.map( ( tab ) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    title={tab.name}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground justify-start px-3 py-1.5"
                                >
                                    <tab.icon className="h-5 w-5 md:me-2" />
                                    <span className='hidden md:block'>{tab.name}</span>
                                </TabsTrigger>
                            ) )}
                        </TabsList>
                        <div className="w-full p-2">
                            {tabs.map( ( tab ) => (
                                <TabsContent key={tab.value} value={tab.value} className={tab.className}>
                                    {tab.content ? (
                                        <tab.content roomId={roomId} />
                                    ) : (
                                        <div className="p-4">
                                            <p>Content for {tab.name}</p>
                                        </div>
                                    )}
                                </TabsContent>
                            ) )}
                        </div>
                    </Tabs>
                </div>
            </Modal>
        </>
    );
};

export default ChatRoomHeaderModal;