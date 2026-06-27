const User = require('../models/userModel');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler=require('../middleware/asyncHandler')
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
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        next(error);
    }
};
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
cloudinary.config({
  cloudinary:process.env.CLOUDINARY_URL
});

const updateAvatar = asyncHandler(async (req, res, next) => {
    // Check if file parser successfully picked up the image block
    if (!req.file) {
        return next(new AppError('Please select an image file to upload.', 400));
    }

    // 🚀 Stream upload processing directly out of memory buffer
    cloudinary.uploader.upload_stream(
        { folder: 'user_avatars' }, // Keeps your Cloudinary console organized
        async (error, result) => {
            if (error) {
                return next(new AppError('Cloudinary file dispatch engine failed.', 500));
            }

            // Save the newly minted cloud image URL onto our database user document
            const updatedUser = await User.findByIdAndUpdate(
                req.user.id, // Derived from your 'protect' middleware layer
                { avatarUrl: result.secure_url },
                { new: true, runValidators: true }
            ).select('-password');

            res.status(200).json({
                success: true,
                message: 'Avatar media file synced cleanly!',
                data: updatedUser
            });
        }
    ).end(req.file.buffer); // Push the file bits down the pipe channel
});
module.exports = { 
    registerUser, 
    loginUser, 
    refreshAccessToken, 
    logoutUser,
    updateAvatar
};