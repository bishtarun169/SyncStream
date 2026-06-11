const express = require('express');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoute');

const app = express();
const cors = require('cors');
app.use(cors());

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiters
const generalAuthLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 20,
     message: { message: 'Too many requests. Please try again later.' },
     standardHeaders: true,
     legacyHeaders: false,
});

const strictAuthLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 5,
     message: { message: 'Too many requests. Please try again later.' },
     standardHeaders: true,
     legacyHeaders: false,
});

// Apply strict limiter to sensitive endpoints
app.use('/api/auth/verify-otp', strictAuthLimiter);
app.use('/api/auth/resend-otp', strictAuthLimiter);
app.use('/api/auth/forgot-password', strictAuthLimiter);
app.use('/api/auth/reset-password', strictAuthLimiter);
app.use('/api/auth/request-password-otp', strictAuthLimiter);

// Apply general limiter to login and register endpoints
app.use('/api/auth/login', generalAuthLimiter);
app.use('/api/auth/register', generalAuthLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chat', chatRoutes);

module.exports = app;    