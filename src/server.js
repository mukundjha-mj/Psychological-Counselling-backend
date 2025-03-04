const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

// Load environment variables
dotenv.config();

// Import configuration
const connectDB = require('./config/db');
const { verifyEmailConfig } = require('./config/email');

// Import utility functions
const { logAccess, logError, logSystem } = require('./utils/loggerUtils');
const { ApiError } = require('./utils/errorUtils');

// Import routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const bookingRoutes = require('./routes/booking');
const chatRoutes = require('./routes/chat');

// Import models for socket.io
const User = require('./models/User');
const Message = require('./models/Message');

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST']
    }
});

// Connect to database
connectDB();

// Verify email configuration
verifyEmailConfig();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logAccess(req, 'Request received');

    // Log response when it's sent
    const originalSend = res.send;
    res.send = function (data) {
        logAccess(req, `Response sent with status ${res.statusCode}`);
        return originalSend.call(this, data);
    };

    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/chat', chatRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Counseling Platform API',
        version: '1.0.0',
        status: 'online'
    });
});

// 404 handler
app.use((req, res, next) => {
    next(new ApiError(`Route not found: ${req.originalUrl}`, 404));
});

// Error handling middleware
app.use((err, req, res, next) => {
    logError(err, req);

    // Set default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    res.status(statusCode).json({
        success: false,
        message,
        // Only include error details in development
        error: process.env.NODE_ENV === 'development' ? {
            stack: err.stack,
            name: err.name
        } : undefined
    });
});

// Socket.io connection handler
io.on('connection', socket => {
    logSystem('New socket connection', { socketId: socket.id });

    // Authenticate socket connection
    socket.on('authenticate', async ({ token }) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);

            if (!user) {
                socket.emit('auth_error', { message: 'Authentication failed' });
                return;
            }

            // Store user info with socket
            socket.userId = user._id;
            socket.user = user;

            // Join a personal room for receiving direct messages
            socket.join(user._id.toString());

            socket.emit('authenticated', { userId: user._id });
            logSystem(`User authenticated on socket`, { userId: user._id, socketId: socket.id });
        } catch (err) {
            socket.emit('auth_error', { message: 'Authentication failed' });
            logError(err);
        }
    });

    // Handle new messages
    socket.on('send_message', async (data) => {
        try {
            const { receiverId, text } = data;

            if (!socket.userId) {
                socket.emit('message_error', { message: 'Not authenticated' });
                return;
            }

            // Create and save message
            const message = await Message.create({
                senderId: socket.userId,
                receiverId,
                text
            });

            // Emit to receiver if online
            io.to(receiverId).emit('new_message', {
                message,
                sender: {
                    _id: socket.userId,
                    name: socket.user.name
                }
            });

            // Acknowledge message receipt
            socket.emit('message_sent', { success: true, messageId: message._id });
        } catch (err) {
            socket.emit('message_error', { message: err.message });
            logError(err);
        }
    });

    // Handle typing indicator
    socket.on('typing', ({ receiverId, isTyping }) => {
        if (!socket.userId) return;

        io.to(receiverId).emit('user_typing', {
            userId: socket.userId,
            isTyping
        });
    });

    // Handle read receipts
    socket.on('mark_read', async ({ messageIds }) => {
        try {
            if (!socket.userId) {
                socket.emit('read_error', { message: 'Not authenticated' });
                return;
            }

            await Message.updateMany(
                { _id: { $in: messageIds }, receiverId: socket.userId },
                { read: true }
            );

            // Get sender IDs to notify
            const messages = await Message.find({ _id: { $in: messageIds } });
            const senderIds = [...new Set(messages.map(msg => msg.senderId.toString()))];

            // Notify senders that messages were read
            senderIds.forEach(senderId => {
                io.to(senderId).emit('messages_read', {
                    reader: socket.userId,
                    messageIds
                });
            });
        } catch (err) {
            socket.emit('read_error', { message: err.message });
            logError(err);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        logSystem('Client disconnected', { socketId: socket.id });
    });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    logSystem(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logError(err);
    console.error('Unhandled Promise rejection:', err);

    // If in production, exit on critical errors
    if (process.env.NODE_ENV === 'production') {
        server.close(() => process.exit(1));
    }
});