/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Create a standardized error response
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @returns {Object} - Standardized error object
 */
const errorResponse = (statusCode, message) => {
    return {
        success: false,
        statusCode,
        message,
    };
};

/**
 * Create a 404 Not Found error
 * @param {String} resource - Name of the resource that wasn't found
 * @returns {ApiError} - Not found error
 */
const notFoundError = (resource = 'Resource') => {
    return new ApiError(`${resource} not found`, 404);
};

/**
 * Create a 401 Unauthorized error
 * @param {String} message - Custom message (optional)
 * @returns {ApiError} - Unauthorized error
 */
const unauthorizedError = (message = 'Not authorized to access this resource') => {
    return new ApiError(message, 401);
};

/**
 * Create a 403 Forbidden error
 * @param {String} message - Custom message (optional)
 * @returns {ApiError} - Forbidden error
 */
const forbiddenError = (message = 'Forbidden - You do not have permission to perform this action') => {
    return new ApiError(message, 403);
};

/**
 * Create a 400 Bad Request error
 * @param {String} message - Custom message (optional)
 * @returns {ApiError} - Bad request error
 */
const badRequestError = (message = 'Invalid request data') => {
    return new ApiError(message, 400);
};

module.exports = {
    ApiError,
    errorResponse,
    notFoundError,
    unauthorizedError,
    forbiddenError,
    badRequestError,
};