const express = require('express');

const router = express.Router();

const { registerUser , loginUser, getCurrentUser, updateUser, deleteUser, verifyOTP, resendOTP } = require('../controllers/authController');
const authMiddle = require('../middleware/authMiddleware');
const sendOTPEmail = require('../utils/sendEmail');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

//@route   POST /api/auth/login
//@desc    Login user and return JWT token
//@access  Public
router.post('/login', loginUser);

//@route   POST /api/auth/verify-otp
//@desc    Verify user's OTP
//@access  Public
router.post('/verify-otp', verifyOTP);

//@route   POST /api/auth/resend-otp
//@desc    Resend OTP to user
//@access  Public
router.post('/resend-otp', resendOTP);

//@route   GET /api/auth/me
//@desc    Get current user info
//@access  Private
router.get('/me', authMiddle, getCurrentUser);

//@route   PUT /api/auth/update
//@desc    Update user details
//@access  Private
router.put('/update', authMiddle, updateUser);

//@route   DELETE /api/auth/delete
//@desc    Delete user account
//@access  Private
router.delete('/delete', authMiddle, deleteUser);

module.exports = router; 