
const User = require('../models/User');

// Add a friend by User ID
const addFriend = async (req, res) => {
     try {
          const { friendUserId } = req.body;
          if (!friendUserId) {
               return res.status(400).json({ message: 'Friend User ID is required' });
          }

          // Find current user
          const currentUser = await User.findById(req.user.userId);
          if (!currentUser) {
               return res.status(404).json({ message: 'Current user not found' });
          }

          // Find the friend by userId
          const friendUser = await User.findOne({ userId: friendUserId.trim().toLowerCase() });
          if (!friendUser) {
               return res.status(404).json({ message: 'User not found' });
          }

          // Check if self addition
          if (friendUser._id.toString() === currentUser._id.toString()) {
               return res.status(400).json({ message: 'You cannot add yourself as a friend' });
          }

          // Check if already friends
          if (currentUser.friends && currentUser.friends.includes(friendUser._id)) {
               return res.status(400).json({ message: 'You are already friends with this user' });
          }

          // Initialize friends array if undefined
          if (!currentUser.friends) {
               currentUser.friends = [];
          }

          // Add friend
          currentUser.friends.push(friendUser._id);
          await currentUser.save();

          res.status(200).json({
               message: 'Friend added successfully',
               friend: {
                    _id: friendUser._id,
                    name: friendUser.name,
                    email: friendUser.email,
                    userId: friendUser.userId,
                    profilePic: friendUser.profilePic
               }
          });

     } catch (error) {
          console.error("ERROR in addFriend:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Retrieve user's friends
const getFriends = async (req, res) => {
     try {
          const user = await User.findById(req.user.userId).populate('friends', 'name email userId profilePic');
          if (!user) {
               return res.status(404).json({ message: 'User not found' });
          }
          res.status(200).json({ friends: user.friends || [] });
     } catch (error) {
          console.error("ERROR in getFriends:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Send room invitation to a friend
const inviteFriend = async (req, res) => {
     try {
          const { friendId, roomId, roomName } = req.body;
          if (!friendId || !roomId) {
               return res.status(400).json({ message: 'Friend ID and Room ID are required' });
          }

          const currentUser = await User.findById(req.user.userId);
          if (!currentUser) {
               return res.status(404).json({ message: 'Current user not found' });
          }

          const friendUser = await User.findById(friendId);
          if (!friendUser) {
               return res.status(404).json({ message: 'Friend not found' });
          }

          // Initialize notifications array if undefined
          if (!friendUser.notifications) {
               friendUser.notifications = [];
          }

          // Push invitation notification to friend
          const notificationId = Math.random().toString(36).substring(2, 11);
          const notification = {
               id: notificationId,
               sender: currentUser.name,
               text: `invited you to watch: ${roomName || 'Watch Room'}`,
               room: roomId,
               createdAt: new Date()
          };
          friendUser.notifications.push(notification);

          await friendUser.save();

          // Emit directly to friend's socket if connected
          const userSocketMap = req.app.get('userSocketMap');
          const io = req.app.get('io');
          if (userSocketMap && io && userSocketMap.has(friendId)) {
               io.to(userSocketMap.get(friendId)).emit("new-notification", notification);
          }

          res.status(200).json({ message: 'Invitation sent successfully' });

     } catch (error) {
          console.error("ERROR in inviteFriend:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Dismiss or Remove a notification
const dismissNotification = async (req, res) => {
     try {
          const { notificationId } = req.body;
          if (!notificationId) {
               return res.status(400).json({ message: 'Notification ID is required' });
          }

          const user = await User.findById(req.user.userId);
          if (!user) {
               return res.status(404).json({ message: 'User not found' });
          }

          if (user.notifications) {
               user.notifications = user.notifications.filter(n => n.id !== notificationId);
               await user.save();
          }

          res.status(200).json({ message: 'Notification dismissed successfully' });

     } catch (error) {
          console.error("ERROR in dismissNotification:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Remove a friend
const removeFriend = async (req, res) => {
     try {
          const { friendUserId } = req.params;
          const userId = req.user.userId;

          await User.findByIdAndUpdate(userId, { $pull: { friends: friendUserId } });
          res.status(200).json({ message: 'Friend removed successfully' });
     } catch (error) {
          console.error("ERROR in removeFriend:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

module.exports = { 
     addFriend,
     getFriends,
     inviteFriend,
     dismissNotification,
     removeFriend
};