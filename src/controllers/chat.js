const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a new message
// @route   POST /api/chat/send
// @access  Private
exports.sendMessage = async (req, res, next) => {
    try {
        const { receiverId, text } = req.body;

        // Check if receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({
                success: false,
                message: 'Receiver not found'
            });
        }

        // Create message
        const message = await Message.create({
            senderId: req.user.id,
            receiverId,
            text
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get conversation between current user and another user
// @route   GET /api/chat/:userId
// @access  Private
exports.getConversation = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get messages between current user and specified user
        const messages = await Message.find({
            $or: [
                { senderId: req.user.id, receiverId: userId },
                { senderId: userId, receiverId: req.user.id }
            ]
        })
            .sort({ createdAt: 1 });

        // Mark messages as read if recipient is current user
        await Message.updateMany(
            { senderId: userId, receiverId: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            count: messages.length,
            data: messages
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get list of users that current user has conversations with
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res, next) => {
    try {
        // Find unique users the current user has exchanged messages with
        const sentMessages = await Message.distinct('receiverId', {
            senderId: req.user.id
        });

        const receivedMessages = await Message.distinct('senderId', {
            receiverId: req.user.id
        });

        // Combine unique user IDs
        const conversationUserIds = [...new Set([...sentMessages, ...receivedMessages])];

        // Get user details
        const conversationUsers = await User.find({
            _id: { $in: conversationUserIds }
        }).select('name role');

        // Get unread message counts
        const unreadCounts = await Promise.all(
            conversationUserIds.map(async userId => {
                const count = await Message.countDocuments({
                    senderId: userId,
                    receiverId: req.user.id,
                    read: false
                });

                return {
                    userId,
                    unreadCount: count
                };
            })
        );

        // Add unread counts to user objects
        const conversations = conversationUsers.map(user => {
            const unreadInfo = unreadCounts.find(
                item => item.userId.toString() === user._id.toString()
            );

            return {
                _id: user._id,
                name: user.name,
                role: user.role,
                unreadCount: unreadInfo ? unreadInfo.unreadCount : 0
            };
        });

        res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Mark all messages as read from a specific user
// @route   PUT /api/chat/:userId/read
// @access  Private
exports.markAsRead = async (req, res, next) => {
    try {
        const { userId } = req.params;

        // Update all unread messages from this user
        const result = await Message.updateMany(
            { senderId: userId, receiverId: req.user.id, read: false },
            { read: true }
        );

        res.status(200).json({
            success: true,
            count: result.nModified,
            message: `${result.nModified} messages marked as read`
        });
    } catch (err) {
        next(err);
    }
};