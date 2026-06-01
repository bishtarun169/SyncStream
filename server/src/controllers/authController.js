const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// User registration controller
const registerUser = async (req, res) => {
     console.log(req.body);
     try {
          const { name, email, password } = req.body;
          
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

module.exports = { registerUser, loginUser };      