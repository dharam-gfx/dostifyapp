// src/app/api/socket/route.ts
import { Server as IOServer } from 'socket.io';
import { NextResponse } from 'next/server';
import { createServer } from 'http';

// Track rooms and users
type Rooms = Record<string, Set<string>>;
const rooms: Rooms = {};

// Define a custom interface for global with our socket server
interface CustomGlobal {
    socketIOServer?: IOServer;
}

// Global object that will store our socket server instance

const globalForSocket: CustomGlobal = global as unknown as CustomGlobal;

// HTTP server instance
let httpServer: ReturnType<typeof createServer>;

export async function GET() {
    // Check if server already exists to prevent re-initialization
    if ( globalForSocket.socketIOServer ) {
        return NextResponse.json( { message: 'Socket server already running' }, { status: 200 } );
    }
    try {    // Create HTTP server if not exists
        if ( !httpServer ) {
            httpServer = createServer();
            // Use port 3000
            httpServer.listen( 3002, () => {
                console.log( 'Socket.IO server listening on port 3001' );
            } );

            // Log errors on the HTTP server
            httpServer.on( 'error', ( err ) => {
                console.error( 'HTTP server error:', err );
            } );
        }

        // Create and save the socket server instance
        const io = new IOServer( httpServer, {
            cors: {
                origin: '*', // Allow connections from all origins
                methods: ['GET', 'POST'],
                credentials: true
            },
            transports: ['websocket', 'polling'], // Enable all transport methods
        } );

        // Store for reuse on hot reloads
        globalForSocket.socketIOServer = io;

        // Handle socket connections
        io.on( 'connection', ( socket ) => {
            console.log( 'Socket connected:', socket.id );

            // Handle room joining
            socket.on( 'joinRoom', ( roomId: string ) => {
                console.log( `User ${socket.id} joined room ${roomId}` );
                socket.join( roomId );
                rooms[roomId] = rooms[roomId] || new Set();
                rooms[roomId].add( socket.id );

                // Send a welcome message to the room
                socket.to( roomId ).emit( 'chatMessage', {
                    type: 'system',
                    message: `A new user has joined the room`
                } );

                // Log room state
                console.log( `Room ${roomId} has ${rooms[roomId].size} users` );
            } );

            // Handle chat messages
            socket.on( 'chatMessage', ( { roomId, message }: { roomId: string; message: string } ) => {
                console.log( `Message in room ${roomId}: ${message} from ${socket.id}` );
                // Broadcast to everyone in the room EXCEPT the sender
                socket.to( roomId ).emit( 'chatMessage', { sender: socket.id, message } );
            } );

            // Handle errors
            socket.on( 'error', ( error ) => {
                console.error( 'Socket error:', error );
            } );

            // Handle disconnection
            socket.on( 'disconnecting', () => {
                console.log( `Socket ${socket.id} disconnecting` );
                for ( const roomId of socket.rooms ) {
                    if ( rooms[roomId] ) {
                        rooms[roomId].delete( socket.id );
                        console.log( `Removed user ${socket.id} from room ${roomId}` );
                        if ( rooms[roomId].size === 0 ) {
                            delete rooms[roomId];
                            console.log( `Room ${roomId} is now empty and deleted` );
                        }
                    }
                }
            } );
        } );

        // Log server events
        io.engine.on( 'connection_error', ( err ) => {
            console.error( 'Connection error:', err );
        } );    // Don't wait for connections to return the response
        console.log( 'Socket.IO server initialized successfully' );
        return NextResponse.json( {
            message: 'Socket server initialized',
            port: 3002,
            timestamp: new Date().toISOString()
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        } );
    } catch ( error ) {
        console.error( 'Socket server initialization failed:', error );
        return NextResponse.json( {
            message: 'Socket server initialization failed',
            error: error instanceof Error ? error.message : String( error ),
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        } );
    }
}
