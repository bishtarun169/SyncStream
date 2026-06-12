const Message = require('../models/Message');

// Create a new message
const sendMessage = async (req, res) => {
     try {
          const { content } = req.body;
          if (!content || !content.trim()) {
               return res.status(400).json({
                    message: 'Message cannot be empty'
               });
          }

          if (req.room.chatDisabled) {
               return res.status(403).json({
                    message: 'Chat is disabled in this room'
               });
          }

          const message = await Message.create({
               chat: req.room._id,
               sender: req.user.userId,
               content: content.trim()
          });

          await message.populate(
               'sender',
               'name profilePic userId'
          );

          res.status(201).json({
               message: 'Message sent',
               data: message
          });

     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};

// Get Message
const getMessages = async (req, res) => {
     try {
          const messages = await Message.find({
               chat: req.room._id
          })
               .populate('sender', 'name profilePic userId')
               .sort({ createdAt: 1 });

          res.status(200).json(messages);

     } catch (error) {
          console.error(error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};

module.exports = {
     sendMessage,
     getMessages
};   