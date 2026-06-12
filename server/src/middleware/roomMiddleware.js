const Room = require('../models/Room');

// Check if room exists
const roomExists = async (req, res, next) => {
    try {
        const roomId = req.params.roomID || req.params.id; 
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        req.room = room;
        next();
    } catch (error) {
        console.error(error.message);

        if (error.name === 'CastError') {
            return res.status(404).json({
                message: 'Room not found'
            });
        }
        res.status(500).json({
            message: 'Server error'
        });
    }
};

// Check if authenticated user is the room host
const isHost = (req, res, next) => {
    try {
        const userId = req.user.userId;
        const room = req.room;

        if (room.host.toString() !== userId) {
            return res.status(403).json({
                message: 'Access denied. Only the host can perform this action.'
            });
        }

        next();
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Server error'
        });
    }
};

module.exports = {
    roomExists,
    isHost
};