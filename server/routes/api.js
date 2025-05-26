import express from 'express';
const router = express.Router();

// Export the router setup function
export default function(chatRooms) {
    // Health check endpoint
    router.get('/health', (req, res) => {
        res.status(200).json({ 
            status: 'ok', 
            uptime: process.uptime(),
            timestamp: new Date(),
            rooms: Object.keys(chatRooms).length
        });
    });

    // Check if a room exists (strict check - no creation)
    router.get('/check-room/:roomId', (req, res) => {
        try {
            const { roomId } = req.params;
            const exists = roomId in chatRooms;
            
            // Simply return if the room exists, don't create it
            res.json({ exists });
        } catch (error) {
            console.error('Error checking room:', error);
            res.status(500).json({ error: 'Failed to check room status' });
        }
    });

    // Create a new room
    router.post('/create-room/:roomId', (req, res) => {
        try {
            const { roomId } = req.params;
            
            // If room already exists, return success but indicate it wasn't created
            if (roomId in chatRooms) {
                return res.json({ success: true, created: false });
            }
            
            // Create the new room
            chatRooms[roomId] = {
                messages: [],
                users: new Set(),
            };
            
            res.json({ success: true, created: true });
        } catch (error) {
            console.error('Error creating room:', error);
            res.status(500).json({ error: 'Failed to create room' });
        }
    });

    return router;
}
