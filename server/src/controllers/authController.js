const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendOTPEmail = require('../utils/sendEmail');
const validator = require('validator');
require('dotenv').config();

const validatePasswordStrength = (password) => {
     if (!password || password.length < 8) {
          return { isValid: false, message: 'Password must be at least 8 characters' };
     }
     if (!/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) {
          return { isValid: false, message: 'Password must contain at least one number and one special character' };
     }
     return { isValid: true };
};

// User registration controller
const registerUser = async (req, res) => {
     try {
          let { name, email, password , confirmPassword, userId } = req.body;
          
          // Validate User ID
          if (!userId) {
               return res.status(400).json({ message: 'User ID is required' });
          }

          if (!email) {
               return res.status(400).json({ message: 'Email is required' });
          }

          // Trim inputs
          email = validator.trim(email);
          userId = validator.trim(userId);

          // Validate email
          if (!validator.isEmail(email)) {
               return res.status(400).json({ message: 'Invalid email address' });
          }

          const userIdRegex = /^[a-zA-Z0-9_.]+$/;
          if (!userIdRegex.test(userId)) {
               return res.status(400).json({ message: 'User ID can only contain letters, numbers, underscores, and periods' });
          }

          if (userId.length < 3 || userId.length > 20) {
               return res.status(400).json({ message: 'User ID must be between 3 and 20 characters' });
          }

          // Validate password strength
          const passwordCheck = validatePasswordStrength(password);
          if (!passwordCheck.isValid) {
               return res.status(400).json({ message: passwordCheck.message });
          }

          // Check if passwords match
          if (password !== confirmPassword) {
               return res.status(400).json({ message: 'Passwords do not match' });
          }

          // Check if userId already exists
          let userByUserId = await User.findOne({ userId: userId.toLowerCase() });
          if (userByUserId) {
               return res.status(400).json({ message: 'User ID is already taken' });
          }

          // Check if user already exists by email
          let user = await User.findOne({ email: email.toLowerCase() });
          if (user) {
               return res.status(400).json({ message: 'User already exists' });
          }

          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // OTP generation
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

          // Send OTP email
          await sendOTPEmail(email, otp);
          
          // Create new user
          user = new User({ name, email: email.toLowerCase(), password: hashedPassword, userId: userId.toLowerCase(), otp, otpExpiry, isVerified: false, friends: [] });
          await user.save();

          res.status(201).json({ 
               message: 'User registered. Verify OTP to complete registration.',
          });
     } catch (error) {
          console.error("ERROR in registerUser:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// OTP verification controller
const verifyOTP = async (req, res) => {
     try {
          const { email, otp } = req.body;

          // Find user by email
          const user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({ message: 'User not found' });
          }

          // Check if user is already verified
          if (user.isVerified) {
               return res.status(400).json({ message: 'User already verified' });
          }

          // Check if OTP is valid
          if (user.otp !== otp) {
               return res.status(400).json({ message: 'Invalid OTP' });
          }

          // Check if OTP has expired          
          if (user.otpExpiry < new Date()) {
               return res.status(400).json({ message: 'OTP has expired' });
          }

          // Mark user as verified and clear OTP fields
          user.isVerified = true;
          user.otp = undefined;
          user.otpExpiry = undefined;
          await user.save();

          res.status(200).json({ message: 'OTP verified successfully. Registration complete.' });
     } catch (error) {
          console.error("ERROR in verifyOTP:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Resend OTP controller
const resendOTP = async (req, res) => {
     try {
          const { email } = req.body;

          const user = await User.findOne({ email });

          if (!user) {
               return res.status(400).json({
                    message: 'User not found'
               });
          }

          if (user.isVerified) {
               return res.status(400).json({
                    message: 'User already verified'
               });
          }

          const otp = Math.floor(
               100000 + Math.random() * 900000
          ).toString();

          const otpExpiry = new Date(
               Date.now() + 10 * 60 * 1000
          );

          user.otp = otp;
          user.otpExpiry = otpExpiry;

          await user.save();

          // Send OTP email
          await sendOTPEmail(email, otp);

          res.status(200).json({
               message: 'OTP resent successfully'
          });

     } catch (error) {
          console.error("ERROR in resendOTP:", error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};  

// User login controller
const loginUser = async (req, res) => {
     try {
          const { identifier, password } = req.body;

          if (!identifier) {
               return res.status(400).json({ message: 'Email or User ID is required' });
          }

          const trimmedIdentifier = validator.trim(identifier);

          // Check if identifier is email or userId
          let query = {};
          if (trimmedIdentifier.includes('@')) {
               query = { email: trimmedIdentifier.toLowerCase() };
          } else {
               query = { userId: trimmedIdentifier.toLowerCase() };
          }

          // Check if user exists
          const user = await User.findOne(query);
          if (!user) {
               return res.status(400).json({ message: 'Invalid credentials' });
          }

          // Check if user is verified
          if (!user.isVerified) {
               return res.status(400).json({ message: 'Please verify your email before logging in', email: user.email });
          }

          // Compare password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
               return res.status(400).json({ message: 'Wrong Password' });
          }

          // Create JWT token
          const payload = { userId: user._id };
          const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

          res.status(200).json({ 
               message: 'Login successful',
               token,
               user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    userId: user.userId,
                    profilePic: user.profilePic,
                    settings: user.settings
               }
          });
          
     } catch (error) {
          console.error("ERROR in loginUser:", error);
          res.status(500).json({ message: 'Server error' });
     }
};   

// Get current user info controller (protected route)
const getCurrentUser = async (req, res) => {
     try {
          const user = await User.findById(req.user.userId).select('-password').populate('friends', 'name email userId profilePic');
          res.json({ user });
     } catch (error) {
          console.error("ERROR in getCurrentUser:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Update user details (name, profile picture, optional password)
const updateUser = async (req, res) => {
     try {
          const { name, profilePic, password, settings, gender, bio, location, birthday, otp } = req.body;
          const updates = {};
          if (name) updates.name = name;
          if (settings !== undefined) updates.settings = settings;
          if (gender !== undefined) updates.gender = gender;
          if (bio !== undefined) updates.bio = bio;
          if (location !== undefined) updates.location = location;
          if (birthday !== undefined) updates.birthday = birthday;

          if (profilePic !== undefined) {
               if (profilePic && profilePic.startsWith('data:')) {
                    const mimeTypeMatch = profilePic.match(/^data:(image\/(jpeg|png|webp));base64,/);
                    if (!mimeTypeMatch) {
                         return res.status(400).json({ message: 'Only JPEG, PNG, and WebP images are allowed' });
                    }
                    const base64Data = profilePic.replace(/^data:image\/\w+;base64,/, "");
                    if (Buffer.byteLength(base64Data, 'base64') > 2 * 1024 * 1024) {
                         return res.status(400).json({ message: 'Image must be smaller than 2MB' });
                    }
                    const { uploadBase64Image } = require('../utils/uploadImage');
                    const imageUrl = await uploadBase64Image(profilePic);
                    updates.profilePic = imageUrl;
               } else {
                    updates.profilePic = profilePic;
               }
          }

          if (password) {
               if (!otp) {
                    return res.status(400).json({ message: 'OTP is required to change password' });
               }

               const user = await User.findById(req.user.userId);
               if (!user) {
                    return res.status(400).json({ message: 'User not found' });
               }

               if (!user.otp || user.otp !== otp) {
                    return res.status(400).json({ message: 'Invalid OTP code' });
               }

               if (user.otpExpiry < new Date()) {
                    return res.status(400).json({ message: 'OTP has expired' });
               }

               const passwordCheck = validatePasswordStrength(password);
               if (!passwordCheck.isValid) {
                    return res.status(400).json({ message: passwordCheck.message });
               }

               const salt = await bcrypt.genSalt(10);
               updates.password = await bcrypt.hash(password, salt);
               updates.otp = null;
               updates.otpExpiry = null;
          }

          const user = await User.findByIdAndUpdate(
               req.user.userId,
               { $set: updates },
               { returnDocument: 'after' }
          ).select('-password');

          res.json({ message: 'Profile updated successfully', user });
     } catch (error) {
          console.error("ERROR in updateUser:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Delete user account
const deleteUser = async (req, res) => {
     try {
          const userId = req.user.userId;
          await User.findByIdAndDelete(userId);

          // Clean up rooms hosted by this user
          const Room = require('../models/Room');
          await Room.updateMany({ host: userId }, { isActive: false });

          // Remove user from participants in all rooms
          await Room.updateMany(
               { 'participants.user': userId },
               { $pull: { participants: { user: userId } } }
          );

          // Remove user from all other users' friends list
          await User.updateMany({ friends: userId }, { $pull: { friends: userId } });

          // Anonymize/delete chat messages
          const Message = require('../models/chat');
          await Message.updateMany({ sender: userId }, { $set: { sender: null, content: '[deleted]' } });

          res.json({ message: 'Account deleted successfully' });
     } catch (error) {
          console.error("ERROR in deleteUser:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Request password reset code
const forgotPassword = async (req, res) => {
     try {
          const { email } = req.body;

          const user = await User.findOne({ email });

          if (!user) {
               return res.status(400).json({
                    message: 'User with this email does not exist'
               });
          }

          const resetCode = Math.floor(
               100000 + Math.random() * 900000
          ).toString();

          user.resetCode = resetCode;
          user.resetCodeExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          await user.save();

          // Send reset code via email
          await sendOTPEmail(email, resetCode);

          console.log(
               `[PASSWORD RESET] Reset code sent to ${email}`
          );

          res.status(200).json({
               message: 'Reset code sent to your email'
          });

     } catch (error) {
          console.error("ERROR in forgotPassword:", error);
          res.status(500).json({
               message: 'Server error'
          });
     }
};

// Reset password using recovery code
const resetPassword = async (req, res) => {
     try {
          const { email, code, newPassword } = req.body;
          const user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({ message: 'User not found' });
          }

          if (!user.resetCodeExpiry || user.resetCodeExpiry < new Date()) {
               return res.status(400).json({ message: 'Reset code has expired' });
          }

          if (!user.resetCode || user.resetCode !== code) {
               return res.status(400).json({ message: 'Invalid recovery code' });
          }

          const passwordCheck = validatePasswordStrength(newPassword);
          if (!passwordCheck.isValid) {
               return res.status(400).json({ message: passwordCheck.message });
          }

          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(newPassword, salt);
          user.resetCode = undefined;
          user.resetCodeExpiry = undefined;
          await user.save();

          res.status(200).json({ message: 'Password reset successful. You can log in now.' });
     } catch (error) {
          console.error("ERROR in resetPassword:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

// Request an OTP code to authorize a password change (for authenticated users)
const requestPasswordOTP = async (req, res) => {
     try {
          const user = await User.findById(req.user.userId);
          if (!user) {
               return res.status(400).json({ message: 'User not found' });
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

          user.otp = otp;
          user.otpExpiry = otpExpiry;
          await user.save();

          await sendOTPEmail(user.email, otp);

          res.status(200).json({ message: 'Verification code sent to your email.' });
     } catch (error) {
          console.error("ERROR in requestPasswordOTP:", error);
          res.status(500).json({ message: 'Server error' });
     }
};

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

// Dismiss/Remove a notification
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
     registerUser, 
     loginUser, 
     getCurrentUser, 
     updateUser, 
     deleteUser, 
     verifyOTP, 
     resendOTP,
     forgotPassword,
     resetPassword,
     requestPasswordOTP,
     addFriend,
     getFriends,
     inviteFriend,
     dismissNotification,
     removeFriend
};
