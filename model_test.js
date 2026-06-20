require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

const Task = require('./models/taskModel');
const port = process.env.PORT || 7000;

const app = express();
app.use(express.json());

const authRouter = require('./routes/authRoutes');
app.use('/auth', authRouter);

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

app.post('/tasks', [
    body('title')
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long')
        .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required'),
    body('priority')
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority value')
], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        const { title, description, status, priority, user } = req.body;
        const newTask = new Task({ title, description, status, priority, user });
        const savedTask = await newTask.save();
        res.status(201).json({
            success: true,
            data: savedTask
        });
    } catch (err) {
        next(err);
    }
});

app.get('/tasks', async (req, res, next) => {
    try {
        const queryObj = {};
        if (req.query.status) {
            queryObj.status = req.query.status;
        }
        if (req.query.priority) {
            queryObj.priority = req.query.priority;
        }
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const skip = (page - 1) * limit;
        let result = Task.find(queryObj);
        if (req.query.sort) {
            result = result.sort(req.query.sort);
        } else {
            result = result.sort('-createdAt');
        }
        result = result.skip(skip).limit(limit);
        const tasks = await result;
        const totalTasks = await Task.countDocuments(queryObj);
        const totalPages = Math.ceil(totalTasks / limit);
        res.status(200).json({
            tasks,
            total: totalTasks,
            page,
            pages: totalPages
        });
    } catch (err) {
        next(err);
    }
});

app.get('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id).populate('user', '-password');
        if (!task) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({
            success: true,
            data: task
        });
    } catch (err) {
        next(err);
    }
});

app.put('/tasks/:id', async (req, res, next) => {
    try {
        const { title, description } = req.body;

        if (title !== undefined && title.trim() === "") {
            const error = new Error('Title cannot be empty blanks');
            error.statusCode = 400;
            return next(error);
        }

        if (description !== undefined && description.trim() === "") {
            const error = new Error('Description cannot be empty blanks');
            error.statusCode = 400;
            return next(error);
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedTask) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: updatedTask
        });
    } catch (error) {
        next(error);
    }
});

app.delete('/tasks/:id', async (req, res, next) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(req.params.id);

        if (!deletedTask) {
            const error = new Error('Task not found');
            error.statusCode = 404;
            return next(error);
        }
        res.status(200).json({
            success: true,
            data: deletedTask
        });
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message = `Malformatted ID: "${err.value}", please provide a valid ID.`;
    }

    if (err.type === 'entity.parse.failed') {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    }

    res.status(statusCode).json({
        success: false,
        error: message
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});