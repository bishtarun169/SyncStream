const express = require('express');

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const chatRoutes = require('./routes/chatRoute');
const friendRoutes = require('./routes/friendRoutes');

const { generalAuthLimiter, strictAuthLimiter} = require("./middleware/ratelimiter");

const app = express();
const cors = require('cors');
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/friends', friendRoutes);

module.exports = app;    