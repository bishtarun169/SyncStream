const mongoose = require('mongoose');
// Room schema

const roomSchema = new mongoose.Schema({
     roomName: {
          type: String,
          required: true,
          trim: true,
     },
     videoURL: {
          type: String,
          required: true,
     },
     privacy: {
          type: String,
          enum: ['public', 'private'],
          default: 'public',
     },
     password: {
          type: String,
     },
     mediaSource: {
          type: String,
          enum : ['youtube', 'twitch', 'instagram', 'custom'],
          required: true,
     },
     maxParticipants: {
          type: Number,
          default: 10,
          min: 2,
          max: 100, 
     },
     host: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
     },
     roomCode: {
          type: String,
          required: true,
          unique: true,
     },
     participants: [{
     user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
     },

     joinedAt: {
          type: Date,
          default: Date.now
     },

     role: {
          type: String,
          enum: ["host", "member"],
          default: "member"
     },
     isMuted: {
          type: Boolean,
          default: false
     }
     }],
     // Sync state
     currentTime: {
          type: Number,
          default: 0,
     },
     isPlaying: {
          type: Boolean,
          default: false,
     },
     videoStateUpdatedAt: {
          type: Date,
          default: Date.now,
     },
     isActive: {
          type: Boolean,
          default: true,
     },
     chatDisabled: {
          type: Boolean,
          default: false,
     },
     muteAll: {
          type: Boolean,
          default: false,
     },
     roomLocked: {
          type: Boolean,
          default: false,
     },
}, { timestamps: true });

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;