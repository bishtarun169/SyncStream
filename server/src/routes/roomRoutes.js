const express = require('express');

const router = express.Router();

const { createRoom, joinRoom , leaveRoom , getRoom, getParticipants, getRoomByCode, kickParticipant, toggleMuteParticipant, getUserRooms, getPublicRooms } = require('../controllers/roomController');
const authMiddle = require('../middleware/authMiddleware');

// @route   POST /api/rooms/create
// @desc    Create a new room
// @access  Private
router.post('/create-room', authMiddle, createRoom);

// @route   GET /api/rooms
// @desc    Get all rooms for the current user
// @access  Private
router.get('/', authMiddle, getUserRooms);

// @route   GET /api/rooms/public-rooms
// @desc    Get all public rooms
// @access  Private
router.get('/public-rooms', authMiddle, getPublicRooms);

// @route   POST /api/rooms/join
// @desc    Join an existing room
// @access  Private
router.post('/join-room', authMiddle, joinRoom);

// @route   GET /api/rooms/code/:roomCode
// @desc    Get room details by room code
// @access  Private
router.get('/code/:roomCode', authMiddle, getRoomByCode);

// @route   POST /api/rooms/:id/leave
// @desc    Leave a room
// @access  Private
router.post('/:id/leave', authMiddle, leaveRoom);

// @route   GET /api/rooms/:id
// @desc    Get room details
// @access  Private
router.get('/:id', authMiddle, getRoom);

// @route   GET /api/rooms/:id/participants
// @desc    Get participants of a room
// @access  Private
router.get('/:id/participants', authMiddle, getParticipants);

// @route   POST /api/rooms/:id/kick
// @desc    Kick a participant from the room
// @access  Private
router.post('/:id/kick', authMiddle, kickParticipant);

// @route   POST /api/rooms/:id/mute
// @desc    Mute or unmute a participant in the room
// @access  Private
router.post('/:id/mute', authMiddle, toggleMuteParticipant);

module.exports = router; 