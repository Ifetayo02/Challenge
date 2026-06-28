const Task = require('../models/taskModel');
const asyncHandler = require('../middleware/asyncHandler');

const getTodos = asyncHandler(async (req, res, next) => {
    // 💡 1. BUILD THE QUERY OBJECT
    const queryObj = { user: req.user.id }; // Maintain user-scoped data isolation

    // A. Full-Text Search Handler (?search=keyword)
    if (req.query.search) {
        queryObj.$text = { $search: req.query.search };
    }

    // B. Basic Field Filters (status, priority)
    if (req.query.status) queryObj.status = req.query.status;
    if (req.query.priority) queryObj.priority = req.query.priority;

    // C. Dynamic Date Range Filters (?createdAfter=2026-06-01&createdBefore=2026-06-28)
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
module.exports = {
    getTodos,  // 👈 Check spelling! Make sure it's not "getTodos"
    getTodoById,
    createTodo, 
    editTodo,
    deleteTodo
};