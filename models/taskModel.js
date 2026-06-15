const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    // 💡 FIX 1: The explicit 'id' field has been completely removed.
    status: {
        type: String,
        // 💡 FIX 2 & 3: Nested the custom message properly, and changed 'completed' to 'done'
        enum: {
            values: ['pending', 'in-progress', 'done'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);