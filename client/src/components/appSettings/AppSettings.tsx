import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AudioLines, GlobeLock, PaintRoller, Settings, User } from "lucide-react";
import ModeToggle from '@/components/theme/ModeToggle';
import Privacy from '@/components/privacy/Privacy';
import SoundSetting from '@/components/soundSetting/SoundSetting';
import UserNameSetting from '@/components/userSetting/UserNameSetting';
import { Modal } from '@/components/ui/Modal';
import { TabItem } from "@/types/components";

const tabs: TabItem[] = [
    {
        name: "Appearance",
        value: "appearance",
        icon: PaintRoller,
        content: ModeToggle,
    },
    {
        name: "Sound",
        value: "sound",
        icon: AudioLines,
        content: SoundSetting,
    },
    {
        name: "Username",
        value: "username",
        icon: User,
        content: UserNameSetting,
    },
    {
        name: "Privacy",
        value: "privacy",
        className: "h-[400px] overflow-y-auto",
        icon: GlobeLock,
        content: Privacy,
    },
];

const AppSettings = () => {
    return (
        <>
            <Modal title="Settings" description="Customize your chat experience">
                <div className='transform transition-transform duration-[300ms] ease-linear hover:rotate-[270deg]'>
                    <span className='cursor-pointer '>
                        <Settings />
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
                                    <tab.icon className="h-5 w-5 md:me-2 " /> <span className='hidden md:block'>{tab.name}</span>
                                </TabsTrigger>
                            ) )}
                        </TabsList>
                        <div className="w-full p-2">
                            {tabs.map( ( tab ) => (
                                <TabsContent key={tab.value} value={tab.value} className={tab.className}>
                                    {tab.content ? (
                                        <tab.content />
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
    )
}

export default AppSettings