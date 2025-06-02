console.log( "Server is running..." );

import express from "express";
import cors from "cors";
import http from 'http';
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import { configureCors, socketCorsConfig } from './cors-config.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();
const server = http.createServer( app );

// Setup Socket.IO
const io = new Server( server, {
    ...socketCorsConfig,
    maxHttpBufferSize: 5e6,
    pingTimeout: 30000,
    connectTimeout: 10000,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    randomizationFactor: 0.5,
} );

// Express Middleware
configureCors( app );
app.use( express.json( { limit: '5mb' } ) );
app.use( rateLimiter );

const PORT = process.env.PORT || 5000;

// Health Check
app.get( '/', ( req, res ) => {
    res.send( 'DostifyApp backend is running!' );
} );

// In-memory storage
const chatRooms = {};
const typingUsers = {};

// API Routes
import apiRouter from './routes/api.js';
const apiRoutes = apiRouter( chatRooms );
app.use( '/api', apiRoutes );

// Room/typing init
const initializeChatRoom = ( roomId ) => {
    if ( !chatRooms[roomId] ) {
        chatRooms[roomId] = {
            messages: [],
            users: new Set(),
        };
    }
    if ( !typingUsers[roomId] ) {
        typingUsers[roomId] = new Set();
    }
};

// Socket.IO Handling
io.on( 'connection', ( socket ) => {
    console.log( 'Connected:', socket.id );

    let currentRoomId = null;
    let currentUserId = null;
    
    // Handler for re-requesting old messages when user comes back to the tab
    // This handler is at the connection level so it works even after reconnection
    socket.on( 'request-old-messages', ( { roomId, userId } ) => {
        // Use provided roomId, if not available fall back to currentRoomId
        const targetRoomId = roomId || currentRoomId;
        // Use provided userId for logging, otherwise fall back to currentUserId
        const requestingUser = userId || currentUserId || 'Unknown user';
          console.log("Available chat rooms:", Object.keys(chatRooms));
        
        if ( chatRooms[targetRoomId] ) {
            console.log( `Re-sending ${chatRooms[targetRoomId].messages?.length || 0} old messages for ${requestingUser} in room ${targetRoomId}` );
            socket.emit( 'load-old-messages', {
                messages: chatRooms[targetRoomId].messages || []
            } );
            console.log( "Messages sent to client" );
        } else {
            console.log( `Cannot re-send messages: Room ${targetRoomId} not found` );
        }
    });

    socket.on( 'join-room', ( { roomId, userName = "User" } ) => {
        console.log( `${userName} ${socket.id} joined room ${roomId}` );

        initializeChatRoom( roomId );

        const userId = `${userName}_${nanoid( 4 )}`;
        socket.join( roomId );
        chatRooms[roomId].users.add( { id: socket.id, name: userId } );
        currentRoomId = roomId;
        currentUserId = userId;

        const usersArr = Array.from( chatRooms[roomId].users ).map( u => u.name );        // Emit joined confirmation
        socket.emit( 'joined-room', { userId, users: usersArr } );

        // Send previous messages with proper format
        socket.emit( 'load-old-messages', {
            messages: chatRooms[roomId].messages || []
        } );

        // Notify others
        socket.to( roomId ).emit( 'user-joined', { userId, users: usersArr } );

        // Handle message sending
        socket.on( 'send-message', ( { encryptedData, userId, messageId, replyTo } ) => {
            console.log( `Message from ${userId} in room ${roomId}:`, encryptedData, replyTo ? 'Reply to: ' + replyTo.messageId : '' );

            // Save message
            chatRooms[roomId].messages.push( {
                encryptedData,
                userId,
                messageId,
                replyTo,
                timestamp: Date.now()
            } );

            // Broadcast to others
            socket.to( roomId ).emit( 'receive-message', {
                encryptedData,
                userId,
                messageId,
                replyTo
            } );        } );
        
        // Typing indicator
        socket.on( 'user-typing', ( { userId, isTyping } ) => {
            if ( !typingUsers[roomId] ) typingUsers[roomId] = new Set();
            if ( isTyping ) {
                typingUsers[roomId].add( userId );
            } else {
                typingUsers[roomId].delete( userId );
            }
            io.to( roomId ).emit( 'users-typing', {
                userIds: Array.from( typingUsers[roomId] )
            } );
            console.log( `Typing in ${roomId}:`, Array.from( typingUsers[roomId] ) );
        } );

        // Leaving manually
        socket.on( 'leave-room', () => {
            socket.leave( roomId );
            for ( const u of chatRooms[roomId]?.users || [] ) {
                if ( u.id === socket.id ) chatRooms[roomId].users.delete( u );
            }
            typingUsers[roomId]?.delete( currentUserId );
            const usersArr = Array.from( chatRooms[roomId]?.users || [] ).map( u => u.name );
            io.to( roomId ).emit( 'user-left', { userId: currentUserId, users: usersArr } );
            io.to( roomId ).emit( 'users-typing', { userIds: Array.from( typingUsers[roomId] || [] ) } );

            if ( chatRooms[roomId]?.users.size === 0 ) {
                delete chatRooms[roomId];
                delete typingUsers[roomId];
                io.to( roomId ).emit( 'chat-destroyed' );
                console.log( `Room ${roomId} destroyed` );
            }
        } );

        // Disconnection
        socket.on( 'disconnect', () => {
            if ( currentRoomId && currentUserId ) {
                for ( const u of chatRooms[currentRoomId]?.users || [] ) {
                    if ( u.id === socket.id ) chatRooms[currentRoomId].users.delete( u );
                }
                typingUsers[currentRoomId]?.delete( currentUserId );
                const usersArr = Array.from( chatRooms[currentRoomId]?.users || [] ).map( u => u.name );
                io.to( currentRoomId ).emit( 'user-left', { userId: currentUserId, users: usersArr } );
                io.to( currentRoomId ).emit( 'users-typing', { userIds: Array.from( typingUsers[currentRoomId] || [] ) } );

                if ( chatRooms[currentRoomId]?.users.size === 0 ) {
                    delete chatRooms[currentRoomId];
                    delete typingUsers[currentRoomId];
                    io.to( currentRoomId ).emit( 'chat-destroyed' );
                    console.log( `Room ${currentRoomId} destroyed` );
                }
            }
        } );
    } );
} );

// Start server
server.listen( PORT, () => {
    console.log( `Server running at http://localhost:${PORT}` );
} );
