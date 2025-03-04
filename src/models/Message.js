const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: [true, 'Message text is required'],
        trim: true,
        maxlength: [2000, 'Message cannot be more than 2000 characters']
    },
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Add indexes for faster message retrieval
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
MessageSchema.index({ receiverId: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);