const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');

// Create a new room
const createRoom = async (req, res) => {
     console.log("Room created");
     try {
          const { roomName, videoURL, privacy, password, maxParticipants, mediaSource } = req.body;
          const hostId = req.user.userId;
          // Valid Room name
          if (!roomName) {
               return res.status(400).json({ message: 'Room name are required' });
          }

          // Media source validation
          if (!mediaSource) {
               return res.status(400).json({ message: 'Media source is required' });
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
               maxParticipants,
               mediaSource,
               host: hostId,
               roomCode,
               participants: [{
                    user: hostId,
                    role: 'host'
               }]
          });

          console.log("before save");
          await room.save();
          console.log("Room saved");

          res.status(201).json({ message: 'Room created successfully', room });
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

// Join a room
const joinRoom = async (req, res) => {
     try {
          const { roomCode, password } = req.body;
          const userId = req.user.userId;

          // Find room by code
          const room = await Room.findOne({ roomCode });
          if (!room) {
               return res.status(404).json({ message: 'Room not found' });
          }

          // Check if user is already a participant
          if (room.participants.includes(userId)) {
               return res.status(400).json({ message: 'You are already in this room' });
          }

          // If room is private, check password
          if (room.privacy === 'private') {
               if (!password) {
                    return res.status(400).json({ message: 'Password is required to join this room' });
               }
               const isMatch = await bcrypt.compare(password, room.password);
               if (!isMatch) {
                    return res.status(400).json({ message: 'Incorrect password' });
               }
          }
          // Check if room is full
          if (room.participants.length >= room.maxParticipants) {
               return res.status(400).json({ message: 'Room is full' });
          }

          // Add user to participants
          room.participants.push([{
               user: userId,
               role: 'member'
          }]);

          await room.save();

          res.status(200).json({
               message: 'Joined room successfully',
               roomCode: room.roomCode,
               roomName: room.roomName,
               videoURL: room.videoURL,
               host: room.host,
          });

     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

// Leave a room
const leaveRoom = async (req, res) => {
     try {
          const roomId = req.params.id;
          const userId = req.user.userId;

          const room = await Room.findById(roomId);

          if (!room) {
               return res.status(404).json({
                    message: "Room not found"
               });
          }

          if (room.host.toString() === userId) {
               await Room.findByIdAndDelete(roomId);

               return res.status(200).json({
                    message: "Host left. Room deleted."
               });
          }

          room.participants = room.participants.filter(
               participant => participant.user.toString() !== userId
          );

          await room.save();

          res.status(200).json({
               message: "Left room successfully"
          });

     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: "Server error"
          });
     }
};

// Get room details by ID
const getRoom = async (req, res) => {
     try {
          const roomId = req.params.id;
          const room = await Room.findById(roomId)
               .populate('host', 'username email')
               .populate('participants.user', 'username email');

          if (!room) {
               return res.status(404).json({
                    message: 'Room not found'
               });
          }

          res.status(200).json(room);

     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};

// Get participants of a room
const getParticipants = async (req, res) => {
     try {
          const roomId = req.params.id;
          const room = await Room.findById(roomId)
               .populate('host', 'username')
               .populate('participants.user', 'username email');

          if (!room) {
               return res.status(404).json({
                    message: 'Room not found'
               });
          }

          res.status(200).json({
               host: room.host,
               count: room.participants.length,
               participants: room.participants
          });

     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};

const getRoomByCode = async (req, res) => {
     try {
          const room = await Room.findOne({
               roomCode: req.params.roomCode
          });

          if (!room) {
               return res.status(404).json({
                    message: "Room not found"
               });
          }
          res.json(room);
     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: "Server error"
          });
     }
};
module.exports = { createRoom, joinRoom, leaveRoom, getRoom, getParticipants, getRoomByCode };
