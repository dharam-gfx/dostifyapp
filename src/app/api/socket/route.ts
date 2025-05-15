import { Server as IOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import { createServer } from 'http';

// Define a custom interface for global with our socket server
interface CustomGlobal {
    socketIOServer?: IOServer;
}

// Global object that will store our socket server instance
const globalForSocket: CustomGlobal = global as unknown as CustomGlobal;

// HTTP server instance
let httpServer: ReturnType<typeof createServer>;

// Track users in each room by userId (not socket id)
const roomUsers: Record<string, Set<string>> = {};
const userSockets: Record<string, Set<string>> = {};

export async function GET() {
    // Prevent re-initialization on hot reloads
    if ( globalForSocket.socketIOServer ) {
        return NextResponse.json( { message: 'Socket server already running' }, { status: 200 } );
    }
    try {
        console.log( 'Initializing Socket.IO server...' );
        // Create HTTP server if not exists
        if ( !httpServer ) {
            httpServer = createServer();
            httpServer.listen( 3003, () => {
                console.log( 'Socket.IO server listening on port 3003' );
            } );
            httpServer.on( 'error', ( err ) => {
                console.error( 'HTTP server error:', err );
            } );
        }

        // Create and save the socket server instance
        const io = new IOServer( httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
            transports: ['websocket', 'polling'],
        } );

        globalForSocket.socketIOServer = io;

        io.on( 'connection', ( socket ) => {
            console.log( 'Socket connected:', socket.id );

            socket.on( 'joinRoom', ( { roomId, userId }: { roomId: string; userId: string } ) => {
                console.log( `User ${userId} (socket ${socket.id}) joined room ${roomId}` );
                socket.join( roomId );
                // Track userId in room
                roomUsers[roomId] = roomUsers[roomId] || new Set();
                const wasInRoom = roomUsers[roomId].has(userId); // check before adding
                roomUsers[roomId].add( userId );
                // Track sockets for this user
                userSockets[userId] = userSockets[userId] || new Set();
                userSockets[userId].add( socket.id );
                socket.data.userId = userId;
                socket.data.roomId = roomId;
                if (!wasInRoom) { // only emit if user was not already in the room
                    // Only emit to other users (not to all sockets except this one)
                    // Use io.sockets.sockets to get all sockets in the room
                    for (const [id, s] of io.sockets.sockets) {
                        if (id !== socket.id && s.data.roomId === roomId) {
                            s.emit('chatMessage', {
                                type: 'system',
                                message: `${userId} user has joined the room`,
                            });
                        }
                    }
                }
                const userCount = roomUsers[roomId].size;
                console.log( `Room ${roomId} has ${userCount} unique users` );
                io.to( roomId ).emit( 'userCount', userCount );
                console.log( `Emitted userCount event: ${userCount} to room: ${roomId}` );
            } );

            socket.on( 'chatMessage', ( { roomId, message, timestamp }: { roomId: string; message: string; timestamp?: string } ) => {
                console.log( `Message in room ${roomId}: ${message} from ${socket.id}` );
                io.to( roomId ).emit( 'chatMessage', { sender: socket.id, message, timestamp, type: 'text' } );
            } );

            socket.on( 'error', ( error ) => {
                console.error( 'Socket error:', error );
            } );

            socket.on( 'disconnect', () => {
                const userId = socket.data.userId;
                const roomId = socket.data.roomId;
                if ( userId && roomId && roomUsers[roomId] ) {
                    // Remove this socket from user's sockets
                    if ( userSockets[userId] ) {
                        userSockets[userId].delete( socket.id );
                        if ( userSockets[userId].size === 0 ) {
                            delete userSockets[userId];
                        }
                    }
                    // If user has no more sockets in this room, remove from roomUsers
                    const isLastLeave = !userSockets[userId] || userSockets[userId].size === 0;
                    let wasInRoom = false;
                    if ( isLastLeave ) {
                        wasInRoom = roomUsers[roomId].has(userId);
                        roomUsers[roomId].delete( userId );
                    }
                    // Clean up empty room
                    if ( roomUsers[roomId].size === 0 ) {
                        delete roomUsers[roomId];
                    }
                    // Emit updated user count
                    const userCount = roomUsers[roomId]?.size || 0;
                    io.to( roomId ).emit( 'userCount', userCount );
                    // Only emit system message if user was actually in the room
                    if (isLastLeave && wasInRoom) {
                        // Only emit to other users (not to all sockets except this one)
                        for (const [id, s] of io.sockets.sockets) {
                            if (id !== socket.id && s.data.roomId === roomId) {
                                s.emit('chatMessage', {
                                    type: 'system',
                                    message: `${userId} user has removed the room`,
                                });
                            }
                        }
                    }
                }
            } );
        } );

        io.engine.on( 'connection_error', ( err ) => {
            console.error( 'Connection error:', err );
        } );

        console.log( 'Socket.IO server initialized successfully' );
        return NextResponse.json(
            {
                message: 'Socket server initialized',
                port: 3003,
                timestamp: new Date().toISOString(),
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            }
        );
    } catch ( error ) {
        console.error( 'Socket server initialization failed:', error );
        return NextResponse.json(
            {
                message: 'Socket server initialization failed',
                error: error instanceof Error ? error.message : String( error ),
                timestamp: new Date().toISOString(),
            },
            {
                status: 500,
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                },
            }
        );
    }
}
