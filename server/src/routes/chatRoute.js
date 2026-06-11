const express = require('express');
const router = express.Router();
const { sendMessage, getMessages } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const { roomExists } = require('../middleware/roomMiddleware');

// Send a message
router.post('/:roomID', authMiddleware, roomExists, sendMessage);

// Get messages for a room
router.get('/:roomID', authMiddleware, roomExists, getMessages);

module.exports = router;