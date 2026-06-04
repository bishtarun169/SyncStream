const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new room
const createRoom = async (req, res) => {
     try {
          const { roomName, videoURL, privacy, password } = req.body;
          const hostId = req.user;
          // Valid Room name
          if (!roomName) {
               return res.status(400).json({ message: 'Room name are required' });
          }   

          // Valid video URL
          if (!videoURL) {
               return res.status(400).json({ message: 'Video URL is required' });
          }

          // Generate unique room code
          const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

          // Hash password if room is private
          let hashedPassword = null;
          if (privacy === 'private' && !password) {
               return res.status(400).json({ message: 'Password is required for private rooms' });
          }
          if (privacy === 'private' && password) {
               const salt = await bcrypt.genSalt(10);
               hashedPassword = await bcrypt.hash(password, salt);
          }

          // Create new room
          const room = new Room({
               roomName,
               videoURL,
               privacy,
               password: hashedPassword,
               host: hostId,
               roomCode,
               participants: [hostId],
          });

          await room.save();
          res.status(201).json({ message: 'Room created successfully', roomCode });
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

