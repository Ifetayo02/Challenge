const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength:[3,'Title must be at least 3 characters long '],
        maxlength:[100,'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },

    status: {
        type: String,
      
        enum: {
            values: ['pending', 'in-progress', 'done'],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending',
        index:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true,'A task must belong to a user']
    },
    priority: {
        type: String,
        enum: {
            values: ['low', 'medium', 'high'],
            message: '{VALUE} is not a valid priority level'
        },
        default: 'medium'
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);