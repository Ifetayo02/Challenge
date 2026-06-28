const Task = require('../models/taskModel');
const AppError = require('../middleware/appError'); // 🎯 Restored missing import
const asyncHandler = require('../middleware/asyncHandler');

// ==========================================
// 1. GET ALL TODOS (With Advanced Query Features)
// ==========================================
const getAllTodos = asyncHandler(async (req, res, next) => {
    // 💡 1. BUILD THE QUERY OBJECT
    const queryObj = { user: req.user.id }; // Maintain user-scoped data isolation

    // A. Full-Text Search Handler (?search=keyword)
    if (req.query.search) {
        queryObj.$text = { $search: req.query.search };
    }

    // B. Basic Field Filters (status, priority)
    if (req.query.status) queryObj.status = req.query.status;
    if (req.query.priority) queryObj.priority = req.query.priority;

    // C. Dynamic Date Range Filters (?createdAfter=&createdBefore=)
    if (req.query.createdAfter || req.query.createdBefore) {
        queryObj.createdAt = {};
        if (req.query.createdAfter) {
            queryObj.createdAt.$gte = new Date(req.query.createdAfter); // Greater than or equal to
        }
        if (req.query.createdBefore) {
            queryObj.createdAt.$lte = new Date(req.query.createdBefore); // Less than or equal to
        }
    }

    // 💡 2. EXECUTE QUERY ARCHITECTURE BUILDER
    let result = Task.find(queryObj);

    // D. Dynamic Field Selection Projection (?fields=title,status)
    if (req.query.fields) {
        const fieldsList = req.query.fields.split(',').join(' ');
        result = result.select(fieldsList); // e.g., converts 'title,status' -> 'title status'
    } else {
        result = result.select('-__v'); // Exclude mongoose internal version tracker keys by default
    }

    // E. Existing Sorting Logic Integration
    if (req.query.sort) {
        result = result.sort(req.query.sort);
    } else {
        // If it's a text search, sort by search match score relevance, otherwise default to newest
        if (req.query.search) {
            result = result.sort({ score: { $meta: 'textScore' } });
        } else {
            result = result.sort('-createdAt');
        }
    }

    // F. Existing Pagination Rules Integration
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    result = result.skip(skip).limit(limit);

    // Resolve query out of DB
    const tasks = await result;
    const totalTasks = await Task.countDocuments(queryObj);

    res.status(200).json({
        success: true,
        results: tasks.length,
        total: totalTasks,
        page,
        pages: Math.ceil(totalTasks / limit),
        data: tasks
    });
});

// ==========================================
// 2. GET TODO BY ID
// ==========================================
const getTodoById = asyncHandler(async (req, res, next) => {
    const todo = await Task.findById(req.params.id);
    
    if (!todo) {
        return next(new AppError('Todo item not found', 404));
    }

    // Day 18 User Data Isolation Verification
    if (todo.user.toString() !== req.user.id) {
        return next(new AppError('Forbidden: You do not have permission to view this task', 403));
    }

    res.status(200).json({
        success: true,
        data: todo
    });
});

// ==========================================
// 3. CREATE NEW TODO
// ==========================================
const createTodo = asyncHandler(async (req, res, next) => {
    const { title, description, priority, status } = req.body;

    if (!title) {
        return next(new AppError('Title is required', 400));
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
});

// ==========================================
// 4. EDIT/UPDATE EXISTING TODO
// ==========================================
const editTodo = asyncHandler(async (req, res, next) => {
    const todo = await Task.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo item not found', 404));
    }

    // Day 18 User Data Isolation Verification
    if (todo.user.toString() !== req.user.id) {
        return next(new AppError('Forbidden: You do not have permission to modify this task', 403));
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
});

// ==========================================
// 5. DELETE TODO
// ==========================================
const deleteTodo = asyncHandler(async (req, res, next) => {
    const todo = await Task.findById(req.params.id);

    if (!todo) {
        return next(new AppError('Todo item not found', 404));
    }

    // Day 18 User Data Isolation Verification
    if (todo.user.toString() !== req.user.id) {
        return next(new AppError('Forbidden: You do not have permission to delete this task', 403));
    }

    await todo.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Todo item deleted successfully'
    });
});

// ==========================================
// 🚀 UNIFIED PRODUCTION EXPORTS LIST
// ==========================================
module.exports = {
    getAllTodos, // 🎯 Matches 'todosController.getAllTodos' in your routes perfectly!
    getTodoById,
    createTodo, 
    editTodo,
    deleteTodo
};