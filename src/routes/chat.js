const express = require('express');
const {
    sendMessage,
    getConversation,
    getConversations,
    markAsRead
} = require('../controllers/chat');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/send', protect, sendMessage);
router.get('/conversations', protect, getConversations);
router.get('/:userId', protect, getConversation);
router.put('/:userId/read', protect, markAsRead);

module.exports = router;