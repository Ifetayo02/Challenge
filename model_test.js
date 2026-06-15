require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const Task = require('./models/taskModel');
const port=process.env.PORT

const app = express();
app.use(express.json());
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });
app.post('/tasks', async (req, res, next) => {
    try {
        const { title, description, status } = req.body;
        if (!title || title.trim() === "") {
            const error = new Error('Title is required');
            error.statusCode = 400;
            return next(error);
        }

        const newTask = new Task({
            title,
            description,
            status
        });

        const savedTask = await newTask.save();
        

        res.status(201).json({
            success: true,
            data: savedTask,
            id: savedTask._id 
        });
    } catch (err) {
        next(err); 
    }
});
app.get('/tasks',async (req, res, next) => {
    try{
        const tasks = await Task.find();
        res.status(200).json({
            success: true,
            data: tasks,
            count: tasks.length

        })
    }catch(err){
        next(err);
    }
});
app.get('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
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
        const { title, description, status } = req.body;

      
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
            console.log("3A. Task not found in DB. Forwarding to 404.");
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
    if (err.name==='CastError' && err.kind === 'ObjectId') {
        statusCode = 400;
        message=`Malformatted ID:"${err.value}",Please provide a valid ID.`;
    }
  
    res.status(statusCode).json({
        success: false,
        error: message
    });
});

app.listen(7000, () => { 
    console.log(`Server is running on port 7000`);
});