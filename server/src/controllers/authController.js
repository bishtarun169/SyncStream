const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration controller
const registerUser = async (req, res) => {
     console.log(req.body);
     try {
          const { name, email, password , confirmPassword } = req.body;
          
          // Check if passwords match
          if (password !== confirmPassword) {
               return res.status(400).json({ message: 'Passwords do not match' });
          }

          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Check if user already exists
          let user = await User.findOne({ email });
          if (user) {
               return res.status(400).json({ message: 'User already exists' });
          }

          // Create new user
          user = new User({ name, email, password: hashedPassword });
          await user.save();

          res.status(201).json({ message: 'User registered successfully' });
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

module.exports = { registerUser, loginUser , getCurrentUser, updateUser, deleteUser };