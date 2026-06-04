const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendOTPEmail = require('../utils/sendEmail');
require('dotenv').config();

// User registration controller
const registerUser = async (req, res) => {
     console.log(req.body);
     try {
          const { name, email, password , confirmPassword } = req.body;
          
          // Check if passwords match
          if (password !== confirmPassword) {
               return res.status(400).json({ message: 'Passwords do not match' });
          }

          // Check if user already exists
          let user = await User.findOne({ email });
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
          user = new User({ name, email, password: hashedPassword, otp, otpExpiry, isVerified: false });
          await user.save();

          res.status(201).json({ 
               message: 'User registered. Verify OTP to complete registration.',
          });
     } catch (error) {
          console.error(error.message);
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
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

// Resend  OTP controller
const resendOTP = async (req, res) => {
     try {
          const { email } = req.body;

          // Find user by email
          const user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({ message: 'User not found' });
          }

          // Check if user is already verified
          if (user.isVerified) {
               return res.status(400).json({ message: 'User already verified' });
          }

          // Generate new OTP
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

          // Update user with new OTP
          user.otp = otp;
          user.otpExpiry = otpExpiry;
          await user.save();

          res.status(200).json({ message: 'OTP resent successfully.'});
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};   

// User login controller
const loginUser = async (req, res) => {
     try {
          const { email, password } = req.body;

          // Check if user exists
          const user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({ message: 'Invalid credentials' });
          }

          // Check if user is verified
          if (!user.isVerified) {
               return res.status(400).json({ message: 'Please verify your email before logging in' });
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
               token 
          });
          
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};   

// Get current user info controller (protected route)
// This will be handled in the authRoutes.js file using the authMiddleware

const getCurrentUser = async (req, res) => {
     try {
          const user = await User.findById(req.user.userId).select('-password');
          res.json({ user });
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

module.exports = { registerUser, loginUser , getCurrentUser, verifyOTP, resendOTP };      
// Update user details (name, profile picture, optional password)
const updateUser = async (req, res) => {
     try {
          const { name, profilePic, password, settings } = req.body;
          const updates = {};
          if (name) updates.name = name;
          if (profilePic !== undefined) updates.profilePic = profilePic;
          if (settings !== undefined) updates.settings = settings;

          if (password) {
               const salt = await bcrypt.genSalt(10);
               updates.password = await bcrypt.hash(password, salt);
          }

          const user = await User.findByIdAndUpdate(
               req.user.userId,
               { $set: updates },
               { new: true }
          ).select('-password');

          res.json({ message: 'Profile updated successfully', user });
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

// Delete user account
const deleteUser = async (req, res) => {
     try {
          await User.findByIdAndDelete(req.user.userId);
          res.json({ message: 'Account deleted successfully' });
     } catch (error) {
          console.error(error.message);
          res.status(500).json({ message: 'Server error' });
     }
};

module.exports = { registerUser, loginUser , getCurrentUser, updateUser, deleteUser , verifyOTP, resendOTP };
