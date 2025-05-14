import { NextRequest } from "next/server";
import { sendMessage } from "@/services/pusherService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, chatCode } = body;
    
    console.log("[API] Sending message to channel:", `presence-chat-${chatCode}`, message);
    
    await sendMessage(chatCode, message);
    
    return Response.json({ success: true });
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : String(error);
    console.error("[API] Error sending message:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}
