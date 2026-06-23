
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

const deleteTodo = async (req, res, next) => {
    try {
        const todo = await Task.findById(req.params.id);

        if (!todo) {
            const error = new Error('Todo item not found');
            error.statusCode = 404;
            return next(error);
        }
        const taskOwnerId = todo.user ? todo.user.toString() : null;
        const loggedInUserId = req.user.id || req.user._id;

        if (!taskOwnerId) {
            const error = new Error('This task contains no owner field validation reference');
            error.statusCode = 400;
            return next(error);
        }

        if (taskOwnerId !== loggedInUserId) {
            const error = new Error('Forbidden: You do not have permission to delete this task');
            error.statusCode = 403; 
            return next(error); 
        }

        await todo.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Todo item deleted successfully'
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