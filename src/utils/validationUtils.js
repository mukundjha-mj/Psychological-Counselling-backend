/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid, false otherwise
 */
exports.isValidEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} - Validation result and message
 */
exports.validatePassword = (password) => {
    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long',
        };
    }

    // Check for at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one uppercase letter',
        };
    }

    // Check for at least one lowercase letter
    if (!/[a-z]/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one lowercase letter',
        };
    }

    // Check for at least one number
    if (!/\d/.test(password)) {
        return {
            isValid: false,
            message: 'Password must contain at least one number',
        };
    }

    return {
        isValid: true,
        message: 'Password is valid',
    };
};

/**
 * Validate date format and ensure it's in the future
 * @param {String} dateString - Date string to validate
 * @param {Number} minHoursInFuture - Minimum hours the date should be in the future
 * @returns {Object} - Validation result and parsed date if valid
 */
exports.validateFutureDate = (dateString, minHoursInFuture = 1) => {
    try {
        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return {
                isValid: false,
                message: 'Invalid date format',
            };
        }

        // Check if date is in the future
        const now = new Date();
        const minFutureTime = new Date(now.getTime() + minHoursInFuture * 60 * 60 * 1000);

        if (date < minFutureTime) {
            return {
                isValid: false,
                message: `Date must be at least ${minHoursInFuture} hour(s) in the future`,
            };
        }

        return {
            isValid: true,
            date,
        };
    } catch (error) {
        return {
            isValid: false,
            message: 'Invalid date',
        };
    }
};

/**
 * Sanitize text input to prevent XSS
 * @param {String} text - Text to sanitize
 * @returns {String} - Sanitized text
 */
exports.sanitizeText = (text) => {
    if (!text) return '';

    // Remove HTML tags
    const sanitized = text
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    return sanitized;
};