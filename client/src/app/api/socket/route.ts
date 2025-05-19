// This is a placeholder Next.js API route
// Since your Socket.IO server is already running separately,
// you likely don't need a Socket.IO implementation in your Next.js app

import { NextResponse } from 'next/server';

// This creates a simple GET endpoint that returns the Socket.IO server URL
export async function GET() {
  return NextResponse.json({
    socketServer: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:5000',
    message: 'Socket.IO server is running separately. This is just a reference endpoint.'
  });
}
