const User = require('../models/User');
const Room = require('../models/Room');
const bcrypt = require('bcryptjs');
const validator = require('validator');

// Create a new room
const createRoom = async (req, res) => {
     console.log("Room created");
     try {
          const { roomName, videoURL, privacy, password, maxParticipants, mediaSource } = req.body;
          const hostId = req.user.userId;

          // Valid Room name
          if (!roomName) {
               return res.status(400).json({ message: 'Room name is required' });
          }

          const trimmedRoomName = validator.trim(roomName);

          // Media source validation
          if (!mediaSource) {
               return res.status(400).json({ message: 'Media source is required' });
          }

          // Valid video URL
          if (!videoURL) {
               return res.status(400).json({ message: 'Video URL is required' });
          }

          // Validate URL unless Twitch channel name
          if (!validator.isURL(videoURL, { require_protocol: true })) {
               return res.status(400).json({
                    message: "Invalid URL"
               });
          }

          // Generate unique room code with uniqueness retry logic
          let roomCode, existing;
          do {
               roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
               existing = await Room.findOne({ roomCode });
          } while (existing);

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
               roomName: trimmedRoomName,
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

          // Increment host's roomsCreated stat
          await User.findByIdAndUpdate(hostId, { $inc: { roomsCreated: 1 } });

          // Broadcast public rooms update if room is public
          const io = req.app.get("io");
          if (io && privacy === 'public') {
               io.to("public-rooms").emit("public-rooms-updated");
          }

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
          const room = await Room.findOne({ roomCode, isActive: true });
          if (!room) {
               return res.status(404).json({ message: 'Room not found' });
          }

          // Check if user is already a participant
          const isAlreadyParticipant = room.participants.some(p => p.user && p.user.toString() === userId);
          const isHost = room.host.toString() === userId;

          if (isAlreadyParticipant) {
               return res.status(200).json({
                    message: 'You are already in this room',
                    roomCode: room.roomCode,
                    roomName: room.roomName,
                    videoURL: room.videoURL,
                    host: room.host,
               });
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

          // Enforce allowJoinRequests setting
          if (!isHost) {
               const host = await User.findById(room.host).select('friends settings');
               if (host && host.settings && host.settings.allowJoinRequests === 'friends') {
                    const friendsList = host.friends ? host.friends.map(f => f.toString()) : [];
                    if (!friendsList.includes(userId)) {
                         return res.status(403).json({ message: 'The host only allows friends to join their rooms' });
                    }
               }
          }

          // Check if room is full
          if (room.participants.length >= room.maxParticipants) {
               return res.status(400).json({ message: 'Room is full' });
          }

          // Add user to participants atomically to prevent duplicate joins due to React strict mode / concurrent calls
          const result = await Room.updateOne(
               { _id: room._id, "participants.user": { $ne: userId } },
               {
                    $push: {
                         participants: {
                              user: userId,
                              role: 'member',
                              joinedAt: new Date()
                         }
                    }
               }
          );

          if (result.modifiedCount > 0) {
               // Increment user's roomsJoined stat
               await User.findByIdAndUpdate(userId, { $inc: { roomsJoined: 1 } });

               // Broadcast public rooms update if room is public
               const io = req.app.get("io");
               if (io && room.privacy === 'public') {
                    io.to("public-rooms").emit("public-rooms-updated");
               }
          }

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
          const userId = req.user.userId;
          const room = req.room;
          const io = req.app.get("io");

          if (room.host.toString() === userId) {
               room.isActive = false;
               await room.save();

               if (io) {
                    io.to(room.roomCode).emit("room-ended");
                    if (room.privacy === "public") {
                         io.to("public-rooms").emit("public-rooms-updated");
                    }
               }

               return res.status(200).json({
                    message: "Host left. Room ended."
               });
          }

          room.participants = room.participants.filter(
               participant => participant.user.toString() !== userId
          );

          await room.save();

          if (io) {
               io.to(room.roomCode).emit("participant-left", { userId });
               if (room.privacy === "public") {
                    io.to("public-rooms").emit("public-rooms-updated");
               }
          }

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
          const room = await req.room.populate([
               { path: 'host', select: 'name email userId profilePic' },
               { path: 'participants.user', select: 'name email userId profilePic' }
          ]);

          if (!room.isActive) {
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
          const room = await req.room.populate([
               { path: 'host', select: 'name email userId profilePic' },
               { path: 'participants.user', select: 'name email userId profilePic' }
          ]);

          if (!room.isActive) {
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
               roomCode: req.params.roomCode,
               isActive: true
          }).populate('host', '_id name');

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
const kickParticipant = async (req, res) => {
     try {
          const userId = req.user.userId;
          const { targetUserId } = req.body;
          const room = req.room;

          if (!targetUserId) {
               return res.status(400).json({ message: 'Target User ID is required' });
          }

          if (targetUserId === userId) {
               return res.status(400).json({ message: 'You cannot kick yourself' });
          }

          room.participants = room.participants.filter(
               p => p.user && p.user.toString() !== targetUserId
          );

          await room.save();

          res.status(200).json({
               message: 'Participant kicked successfully',
               participants: room.participants
          });

     } catch (error) {
          console.error("ERROR in kickParticipant:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

const toggleMuteParticipant = async (req, res) => {
     try {
          const { targetUserId } = req.body;
          const room = req.room;

          if (!targetUserId) {
               return res.status(400).json({ message: 'Target User ID is required' });
          }

          const participant = room.participants.find(
               p => p.user && p.user.toString() === targetUserId
          );

          if (!participant) {
               return res.status(404).json({ message: 'Participant not found in this room' });
          }

          participant.isMuted = !participant.isMuted;

          await room.save();

          res.status(200).json({
               message: participant.isMuted ? 'Participant muted successfully' : 'Participant unmuted successfully',
               isMuted: participant.isMuted,
               participants: room.participants
          });

     } catch (error) {
          console.error("ERROR in toggleMuteParticipant:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Update Room Settings
const updateRoomSettings = async (req, res) => {
     try {
          const { chatDisabled, muteAll, roomLocked } = req.body;
          const room = req.room;

          if (chatDisabled !== undefined) room.chatDisabled = chatDisabled;
          if (muteAll !== undefined) room.muteAll = muteAll;
          if (roomLocked !== undefined) room.roomLocked = roomLocked;

          await room.save();

          res.status(200).json({
               message: 'Room settings updated successfully',
               room
          });
     } catch (error) {
          console.error("ERROR in updateRoomSettings:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

const getUserRooms = async (req, res) => {
     try {
          const userId = req.user.userId;
          const rooms = await Room.find({
               $or: [
                    { host: userId },
                    { "participants.user": userId }
               ]
          })
               .populate('host', 'name email userId profilePic')
               .populate('participants.user', 'name email userId profilePic')
               .sort({ updatedAt: -1 })
               .limit(10);

          res.status(200).json(rooms);
     } catch (error) {
          console.error("ERROR in getUserRooms:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

const getPublicRooms = async (req, res) => {
     try {
          const rooms = await Room.find({ privacy: 'public', isActive: true })
               .populate('host', 'name email userId profilePic')
               .populate('participants.user', 'name email userId profilePic')
               .sort({ updatedAt: -1 });

          res.status(200).json(rooms);
     } catch (error) {
          console.error("ERROR in getPublicRooms:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

module.exports = { createRoom, joinRoom, leaveRoom, getRoom, getParticipants, getRoomByCode, kickParticipant, toggleMuteParticipant, getUserRooms, getPublicRooms, updateRoomSettings };
