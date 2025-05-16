console.log( "Server is running..." );
import express from "express";
import cors from "cors";
import http from 'http';
import { Server } from "socket.io";
import { nanoid } from "nanoid";

const app = express();


const server = http.createServer( app );
const io = new Server( server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    }
} );

app.use( cors );
app.use( express.json() );

const PORT = process.env.PORT || 5000;

const chatRooms = {};
const typingUsers = {}; // Track typing users per room

// Initialize chat rooms
const initializeChatRoom = ( roomId ) => {
    if ( !chatRooms[roomId] ) {
        chatRooms[roomId] = {
            messages: [],
            users: new Set(),
        };
    }
    if (!typingUsers[roomId]) {
        typingUsers[roomId] = new Set();
    }
};

io.on( 'connection', ( socket ) => {
    console.log( 'Connected:', socket.id );

    let currentRoomId = null;
    let currentUserId = null;

    socket.on( 'join-room', ( { roomId, userName = "User" } ) => {
        console.log( `${userName} ${socket.id} joined room ${roomId}` );

        initializeChatRoom( roomId );

        const userId = `${userName}_${nanoid( 4 )}`;
        socket.join( roomId );
        chatRooms[roomId].users.add({ id: socket.id, name: userId });
        currentRoomId = roomId;
        currentUserId = userId;

        // Send all users' names to everyone in the room
        const usersArr = Array.from(chatRooms[roomId].users).map(u => u.name);
        socket.emit( 'joined-room', { userId, users: usersArr } );
        socket.to( roomId ).emit( 'user-joined', { userId, users: usersArr } );

        socket.on( 'send-message', ( { encryptedData , userName} ) => {
            socket.to( roomId ).emit( 'receive-message', { encryptedData, userName } );
        } );

        socket.on( 'user-typing', ( { userId, isTyping } ) => {
            if (!typingUsers[roomId]) typingUsers[roomId] = new Set();
            if (isTyping) {
                typingUsers[roomId].add(userId);
            } else {
                typingUsers[roomId].delete(userId);
            }
            io.to(roomId).emit('users-typing', { userIds: Array.from(typingUsers[roomId]) });
            console.log(`Users typing in room ${roomId}: ${Array.from(typingUsers[roomId])}`);
            
        });

        socket.on( 'disconnect', () => {
            if (currentRoomId && currentUserId) {
                chatRooms[currentRoomId]?.users.forEach((u) => {
                    if (u.id === socket.id) chatRooms[currentRoomId].users.delete(u);
                });
                typingUsers[currentRoomId]?.delete(currentUserId);
                const usersArr = Array.from(chatRooms[currentRoomId]?.users || []).map(u => u.name);
                io.to(currentRoomId).emit('user-left', { userId: currentUserId, users: usersArr });
                io.to(currentRoomId).emit('users-typing', { userIds: Array.from(typingUsers[currentRoomId] || []) });
                if ( chatRooms[currentRoomId]?.users.size === 0 ) {
                    delete chatRooms[currentRoomId];
                    delete typingUsers[currentRoomId];
                    io.to( currentRoomId ).emit( 'chat-destroyed' );
                    console.log( `Room ${currentRoomId} destroyed` );
                }
            }
        } );

        socket.on( 'leave-room', () => {
            socket.leave( roomId );
            chatRooms[roomId]?.users.forEach((u) => {
                if (u.id === socket.id) chatRooms[roomId].users.delete(u);
            });
            typingUsers[roomId]?.delete(currentUserId);
            const usersArr = Array.from(chatRooms[roomId]?.users || []).map(u => u.name);
            io.to(roomId).emit('user-left', { userId: currentUserId, users: usersArr });
            io.to(roomId).emit('users-typing', { userIds: Array.from(typingUsers[roomId] || []) });
            if ( chatRooms[roomId]?.users.size === 0 ) {
                delete chatRooms[roomId];
                delete typingUsers[roomId];
                io.to( roomId ).emit( 'chat-destroyed' );
            }
        } );
    } );
} );

server.listen( PORT, () => {
    console.log( `Server running at http://localhost:${PORT}` );
} );