const express = require('express');
const router = express.Router();

const { 
     registerUser, 
     loginUser, 
     getCurrentUser, 
     updateUser, 
     deleteUser,
     verifyOTP,
     resendOTP,
     forgotPassword,
     resetPassword,
     requestPasswordOTP
} = require('../controllers/authController');

const authMiddle = require('../middleware/authMiddleware');

// Authentication & Registration
router.post('/register', registerUser);
router.post('/login', loginUser);

// Verification (OTP)
router.post('/verify-otp', verifyOTP); // single OTP verification endpoint
router.post('/resend-otp', resendOTP);

// Password Recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// User Profile Actions
router.get('/me', authMiddle, getCurrentUser);
router.put('/update', authMiddle, updateUser);
router.delete('/delete', authMiddle, deleteUser);
router.post('/request-password-otp', authMiddle, requestPasswordOTP);

module.exports = router;