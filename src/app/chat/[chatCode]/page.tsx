// import TypingIndicator from "@/components/ui/TypingIndicator"
import ChatControls from "../ChatControls"
import ChatFeed from "../ChatFeed"
import ChatRoomHeader from "../ChatRoomHeader"


const page = () => {
    return (
        <div className="flex flex-col h-screen w-full">
            <ChatRoomHeader />
            <div className="flex-1 overflow-y-auto">
                <ChatFeed />
            </div>
            <div className="bg-red-500 mb-5">
            <ChatControls />
            </div>
        </div>
    )
}

export default page