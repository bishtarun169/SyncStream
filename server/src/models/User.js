const mongoose = require('mongoose');

// User schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  userId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  profilePic: {
    type: String,
    default: "",
  },

  gender: {
    type: String,
    default: "",
  },

  bio: {
    type: String,
    default: "",
  },

  location: {
    type: String,
    default: "",
  },

  birthday: {
    type: String,
    default: "",
  },
  
  settings: {
    theme: {
      type: String,
      default: "light",
    },

    allowJoinRequests: {
      type: String,
      default: "everyone",
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpiry: {
    type: Date,
    default: null,
  },
  resetCode: {
    type: String,
    default: null,
  },
  resetCodeExpiry: {
    type: Date,
    default: null,
  },
  roomsCreated: {
    type: Number,
    default: 0,
  },
  roomsJoined: {
    type: Number,
    default: 0,
  },
  totalWatchMinutes: {
    type: Number,
    default: 0,
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  notifications: [{
    id: { type: String, required: true },
    sender: { type: String, required: true },
    text: { type: String, required: true },
    room: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;