// // app/test/page.tsx
// "use client";

// import { useState } from "react";
// import { useSocket } from "@/hooks/useSocket";
// const aa = +Math.floor( Math.random() * 1000 );
// export default function Page() {
//     const [chatCode, setChatCode] = useState( "dostify-test" );
//     const [message, setMessage] = useState( "" );
//     const { userId, sendMessage, sendTyping, usersTyping, userEvents, users, isConnected } = useSocket( chatCode, "dharam" + aa );

//     return (
//         <div className="p-4">
//             <h2>Connected as: {userId || "Joining..."}</h2>
//             <p>Chat Code: {chatCode}</p>
//             <p>Total Users: {users.length}</p>
//             <div className={isConnected ? "text-green-600" : "text-yellow-600"}>
//                 {isConnected ? "Connected" : "Connecting..."}
//             </div>

//             {/* Show join/leave notifications */}
//             {userEvents.joined && <div className="text-green-600">User joined: {userEvents.joined}</div>}
//             <div className="text-red-600">User left: {userEvents.left}</div>

//             {/* Show typing indicator, but exclude current user */}
//             {usersTyping.filter(name => name !== userId).length > 0 && (
//                 <div className="text-blue-600 text-sm mb-2">
//                     {usersTyping.filter(name => name !== userId).join(", ")} {usersTyping.filter(name => name !== userId).length === 1 ? 'is' : 'are'} typing...
//                 </div>
//             )}

//             <input
//                 value={message}
//                 onChange={( e ) => {
//                     setMessage( e.target.value );
//                     sendTyping( e.target.value.length > 0 );
//                 }}
//                 onBlur={() => sendTyping( false )}
//                 placeholder="Type message"
//                 className="border p-2 my-2 w-full"
//             />

//             <button
//                 onClick={() => {
//                     sendMessage( message );
//                     setMessage( "" );
//                     sendTyping( false );
//                 }}
//                 className="bg-black text-white px-4 py-2 rounded"
//             >
//                 Send
//             </button>
//         </div>
//     );
// }
