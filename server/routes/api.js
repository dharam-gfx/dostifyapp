import express from 'express';
const router = express.Router();

// Export the router setup function
export default function(chatRooms) {
    // Add endpoint to check room existence
    router.get('/check-room/:roomId', (req, res) => {
        try {
            const { roomId } = req.params;
            const roomExists = chatRooms instanceof Map 
                ? chatRooms.has(roomId) 
                : !!chatRooms[roomId];
                
            res.json({ exists: roomExists });
        } catch (error) {
            console.error('Error checking room:', error);
            res.status(500).json({ error: 'Failed to check room status' });
        }
    });

    return router;
}
