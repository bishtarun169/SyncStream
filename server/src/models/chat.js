const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
}, { timestamps: true });

const Chat = mongoose.model('chat', chatSchema);

module.exports = Chat;