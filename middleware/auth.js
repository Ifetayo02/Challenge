const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            const error = new Error('Not authorized to access this route, token missing');
            error.statusCode = 401;
            return next(error);
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        const error = new Error('Not authorized, token signature verification failed');
        error.statusCode = 401;
        return next(error);
    }
};

module.exports = { protect };