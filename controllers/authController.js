const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            success: true,
            token: token
        });
    } catch (error) {
        next(error);
    }
};
module.exports = { registerUser, loginUser };