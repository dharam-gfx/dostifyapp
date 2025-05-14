import { NextRequest } from "next/server";
import { authenticateUser } from "@/services/pusherService";

console.log("[PUSHER AUTH ROUTE] File loaded");
console.log("[PUSHER ENV] APP_ID:", process.env.PUSHER_APP_ID);
console.log("[PUSHER ENV] KEY:", process.env.NEXT_PUBLIC_PUSHER_KEY);
console.log("[PUSHER ENV] SECRET:", process.env.PUSHER_SECRET);
console.log("[PUSHER ENV] CLUSTER:", process.env.NEXT_PUBLIC_PUSHER_CLUSTER);

export async function POST(req: NextRequest) {
  console.log("[PUSHER AUTH ROUTE] POST handler called");
  console.log("[PUSHER AUTH ROUTE] Headers:", Object.fromEntries(req.headers.entries()));
  // Only try to parse as JSON if the content-type is application/json
  const contentType = req.headers.get("content-type") || "";
  let body: { [key: string]: string } = {};
  let rawText = "";
  if (contentType.includes("application/json")) {
    try {
      body = await req.json();
      console.log("[PUSHER AUTH ROUTE] POST body (json):", body);
    } catch (err) {
      console.error("[PUSHER AUTH ROUTE] Error parsing JSON body:", err);
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  } else {
    // fallback: try to parse as form data
    try {
      rawText = await req.text();
      console.log("[PUSHER AUTH ROUTE] POST body (raw text):", rawText);
      body = {};
      rawText.split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) body[key] = decodeURIComponent(value || '');
      });
      console.log("[PUSHER AUTH ROUTE] POST body (form):", body);
    } catch (formErr) {
      console.error("[PUSHER AUTH ROUTE] Error parsing form body:", formErr);
      return Response.json({ error: "Invalid request body" }, { status: 400 });
    }
  }

  const { socket_id, channel_name, user_id } = body;
  if (!socket_id || !channel_name || !user_id) {
    console.error("[PUSHER AUTH ROUTE] Missing required fields", { socket_id, channel_name, user_id });
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }
  try {
    const auth = authenticateUser(socket_id, channel_name, user_id);
    return Response.json(auth);
  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : String(error);
    console.error("[PUSHER AUTH ROUTE] Error in POST handler:", errMsg);
    return Response.json({ error: errMsg }, { status: 500 });
  }
}

export async function GET() {
  console.log("[PUSHER AUTH ROUTE] GET handler called");
  return Response.json({ status: "GET handler reached" });
}
