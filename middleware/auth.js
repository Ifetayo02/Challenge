const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
    try {
        let token;

        // 💡 1. Check if the Authorization header exists and starts with "Bearer"
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Split "Bearer eyJhbG..." into an array and extract just the token string
            token = req.headers.authorization.split(' ')[1];
        }

        // 💡 2. If no token is found, throw an unauthorized error
        if (!token) {
            const error = new Error('Not authorized to access this route, token missing');
            error.statusCode = 401;
            return next(error);
        }

        // 💡 3. Verify the token token hasn't been modified or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 💡 4. Attach the decoded user payload ({ id, email }) directly to the request object
        req.user = decoded; 

        // 🚀 Step right through to the next controller route function!
        next();
    } catch (err) {
        const error = new Error('Not authorized, token signature verification failed');
        error.statusCode = 401;
        return next(error);
    }
};

module.exports = { protect };