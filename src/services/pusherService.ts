/**
 * Pusher service for chat functionality
 * This service provides a singleton instance of Pusher for use across the application
 */

import Pusher from "pusher";
import { ChatMessage } from "@/types/chat";

// Initialize Pusher with environment variables
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

/**
 * Authenticate a user for a Pusher presence channel
 *
 * @param socketId The socket ID provided by Pusher
 * @param channelName The name of the channel to authenticate for
 * @param userId The user's ID
 * @returns The authentication response for Pusher
 */
export function authenticateUser(socketId: string, channelName: string, userId: string) {
  return pusher.authenticate(socketId, channelName, {
    user_id: userId,
    user_info: {
      name: `User-${userId}`,
    },
  });
}

/**
 * Send a message to a specific chat channel
 *
 * @param chatCode The unique code for the chat room
 * @param message The message to send
 * @returns A promise that resolves when the message is sent
 */
export async function sendMessage(chatCode: string, message: ChatMessage) {
  return pusher.trigger(`presence-chat-${chatCode}`, "new-message", message);
}

export default pusher;
