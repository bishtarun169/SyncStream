const express = require('express');
const router = express.Router();

const authMiddle = require('../middleware/authMiddleware');
const { addFriend, getFriends, inviteFriend, dismissNotification, removeFriend} = require('../controllers/friendController');

// Friends routes
router.post('/add', authMiddle, addFriend);
router.get('/list', authMiddle, getFriends);
router.delete('/:friendUserId', authMiddle, removeFriend);
router.post('/invite', authMiddle, inviteFriend);
router.post('/notifications/dismiss', authMiddle, dismissNotification);

module.exports = router; 