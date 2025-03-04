const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// File paths for different log types
const accessLogPath = path.join(logsDir, 'access.log');
const errorLogPath = path.join(logsDir, 'error.log');
const systemLogPath = path.join(logsDir, 'system.log');

/**
 * Format log message with timestamp
 * @param {String} level - Log level (INFO, ERROR, etc.)
 * @param {String} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {String} - Formatted log message
 */
const formatLogMessage = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    let logMessage = `[${timestamp}] [${level}] ${message}`;

    if (data) {
        try {
            const dataStr = typeof data === 'object' ? JSON.stringify(data) : data;
            logMessage += ` - ${dataStr}`;
        } catch (err) {
            logMessage += ' - [Data could not be serialized]';
        }
    }

    return logMessage + '\n';
};

/**
 * Log access information
 * @param {Object} req - Express request object
 * @param {String} message - Log message
 */
const logAccess = (req, message) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('user-agent'),
        userId: req.user ? req.user._id : 'unauthenticated',
    };

    const logMessage = formatLogMessage('ACCESS', message, logData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(logMessage);
    }

    // Append to access log file
    fs.appendFile(accessLogPath, logMessage, (err) => {
        if (err) console.error('Error writing to access log:', err);
    });
};

/**
 * Log error information
 * @param {Error} error - Error object
 * @param {Object} req - Express request object (optional)
 */
const logError = (error, req = null) => {
    let logData = {
        name: error.name,
        stack: error.stack,
    };

    if (req) {
        logData = {
            ...logData,
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user ? req.user._id : 'unauthenticated',
        };
    }

    const logMessage = formatLogMessage('ERROR', error.message, logData);

    // Always log errors to console
    console.error(logMessage);

    // Append to error log file
    fs.appendFile(errorLogPath, logMessage, (err) => {
        if (err) console.error('Error writing to error log:', err);
    });
};

/**
 * Log system information
 * @param {String} message - Log message
 * @param {Object} data - Additional data to log
 */
const logSystem = (message, data = null) => {
    const logMessage = formatLogMessage('SYSTEM', message, data);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(logMessage);
    }

    // Append to system log file
    fs.appendFile(systemLogPath, logMessage, (err) => {
        if (err) console.error('Error writing to system log:', err);
    });
};

module.exports = {
    logAccess,
    logError,
    logSystem,
};