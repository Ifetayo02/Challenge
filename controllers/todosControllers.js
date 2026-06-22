
const Task = require('../models/taskModel'); 


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
        const todo = await Task.findOne({ _id: req.params.id, user: req.user.id });

        if (!todo) {
            const error = new Error('Todo not found or unauthorized');
            error.statusCode = 404;
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
        const updatedTodo = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id }, 
            req.body,
            { returnDocument: 'after', runValidators: true }
        );

        if (!updatedTodo) {
            const error = new Error('Todo not found or unauthorized');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: updatedTodo
        });
    } catch (error) {
        next(error);
    }
};


const deleteTodo = async (req, res, next) => {
    try {
        const deletedTodo = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!deletedTodo) {
            const error = new Error('Todo not found or unauthorized');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            message: 'Todo item deleted successfully',
            data: deletedTodo
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