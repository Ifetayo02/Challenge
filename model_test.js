require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/authRoutes');
const todoRouter = require('./routes/todosRoutes');
const { protect } = require('./middleware/auth');
const globalErrorHandler = require('./middleware/errorMiddleware');
const port = process.env.PORT || 7000;
app.use((req, res, next) => {
    Object.defineProperty(req, 'query', { value: req.query, writable: true, configurable: true });
    next();
});
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173' 
}));
app.use(
    mongoSanitize({
        replaceWith: '_',
        allowDots: true 
    })
);
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true, 
    legacyHeaders: false, 
});
app.use(globalLimiter); 

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/auth', authLimiter, authRouter); 
app.use('/tasks', protect, todoRouter); 
app.use(globalErrorHandler);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });

mongoose.connection.on('error', err => {
    console.error('Mongoose runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});