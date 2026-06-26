

const Task = require('../models/taskModel');
const AppError = require('../middleware/appError');
const asyncHandler = require('../middleware/asyncHandler');
const deleteTodo = asyncHandler(async (req, res, next) => {
    const todo = await Task.findById(req.params.id);

    // If an ID looks valid but doesn't exist, throw a custom AppError
    if (!todo) {
        return next(new AppError('Todo item not found', 404));
    }

    // Day 18 Ownership Handshake
    if (todo.user.toString() !== req.user.id) {
        return next(new AppError('Forbidden: You do not have permission to delete this task', 403));
    }

    await todo.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Todo item deleted successfully'
    });
});


const getAllTodos = async (req, res, next) => {
    try {
     
        const todos = await Task.find({ user: req.user.id });
        
        res.status(200).json({
            success: true,
            count: todos.length,
            data: todos
        });
    } catch (error) {
        next(error);
    }
};

const getTodoById = async (req, res, next) => {
    try {
        const Todo = await Task.findById(req.params.id);
        if (!Todo) {
            const error = new Error('Todo not found or unauthorized');
            error.statusCode = 404;
            return next(error);
        }
        if(todo.user.toString() !== req.user.id){
            const error = new Error('Forbidden: You do not have permission to view this task');
            error.statusCode = 403;
            return next(error); 
        }
        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        next(error);
    }
};

const createTodo = async (req, res, next) => {
    try {
        const { title, description, priority, status } = req.body;

        if (!title) {
            const error = new Error('Title is required');
            error.statusCode = 400;
            return next(error);
        }

      
        const newTodo = await Task.create({
            title,
            description,
            priority,
            status,
            user: req.user.id 
        });

        res.status(201).json({
            success: true,
            data: newTodo
        });
    } catch (error) {
        next(error);
    }
};


const editTodo = async (req, res, next) => {
    try {
        const Todo = await Task.findById(req.params.id);
            if (!Todo) {
            const error = new Error('Todo not found or unauthorized');
            error.statusCode = 404;
            return next(error);
        }

            if(todo.user.toString() !== req.user.id){
            const error = new Error('Forbidden: You do not have permission to modify this task');
            error.statusCode = 403;
            return next(error); 
        }

        const updatedTodo = await Task.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { returnDocument: 'after', runValidators: true }
        );
        res.status(200).json({
            success: true,
            data: updatedTodo
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllTodos,
    getTodoById,
    createTodo, 
    editTodo,
    deleteTodo
};