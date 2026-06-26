const AppError = require('../middleware/appError');

const globalErrorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') {
        const message = `Resource not found. Malformatted ID: "${err.value}"`;
        error = new AppError(message, 400);
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `An account with that ${field} already exists.`;
        error = new AppError(message, 400);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new AppError(`Validation Failed: ${message}`, 400);
    }
    if (err.name === 'JsonWebTokenError') {
        error = new AppError('Your login signature token is invalid or broken. Please log in again.', 401);
    }
    if (err.name === 'TokenExpiredError') {
        error = new AppError('Your session login token has expired. Please log in again.', 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Internal Server Error'
    });
};

module.exports = globalErrorHandler;