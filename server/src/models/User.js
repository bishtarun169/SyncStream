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
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "",
  },
  settings: {
    theme: {
      type: String,
      default: "dark",
    },
    allowJoinRequests: {
      type: String,
      default: "everyone",
    },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;