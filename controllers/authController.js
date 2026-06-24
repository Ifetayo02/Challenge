const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. REGISTER USER
// ==========================================
const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email: email.toLowerCase() });
        if (userExists) {
            const error = new Error('User with this email already exists');
            error.statusCode = 400;
            return next(error);
        }
        const newUser = await User.create({ name, email, password });

        const userResponse = newUser.toObject();
        delete userResponse.password;

        return res.status(201).json({
            success: true,
            data: userResponse
        });
    } catch (error) {
        error.statusCode = 400;
        next(error);
    }
};

// ==========================================
// 2. LOGIN USER (With Dual Token Cookie Delivery)
// ==========================================
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Please provide email and password');
            error.statusCode = 400;
            return next(error);
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            return next(error);
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            return next(error);
        }
        
        // 🎯 FIX: Changed '15min' format string to '15m'
        const accessToken = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        );
        const refreshToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey', 
            { expiresIn: '7d' }
        );
        
        user.refreshToken = refreshToken;
        await user.save();

        // 🎯 FIX: Added missing comma before the options configuration block
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // 🎯 FIX: Corrected spelling to match variable 'accessToken'
        return res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 3. REFRESH ACCESS TOKEN
// ==========================================
const refreshAccessToken = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) {
            return res.status(401).json({ success: false, error: "Refresh token missing" });
        }

        const refreshToken = cookies.refreshToken;

        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(403).json({ success: false, error: "Invalid refresh token session" });
        }

        jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || 'supersecretrefreshkey',
            (err, decoded) => {
                if (err || user._id.toString() !== decoded.id) {
                    return res.status(403).json({ success: false, error: "Token expired or corrupted" });
                }

                const accessToken = jwt.sign(
                    { id: user._id },
                    process.env.JWT_SECRET,
                    { expiresIn: '15m' }
                );

                res.json({ success: true, accessToken });
            }
        );
    } catch (error) {
        next(error);
    }
};

// ==========================================
// 4. LOGOUT USER
// ==========================================
const logoutUser = async (req, res, next) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.refreshToken) return res.sendStatus(204); 

        const refreshToken = cookies.refreshToken;

        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = '';
            await user.save();
        }

        res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });
        res.status(200).json({ success: true, message: "Logged out cleanly, token wiped" });
    } catch (error) {
        next(error);
    }
};

// 🎯 FIX: Corrected spelling inside exports block mapping object
module.exports = { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser
};