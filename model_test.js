require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const Task = require('./models/taskModel');
const port=process.env.PORT

const app = express();
app.use(express.json());
mongoose.connect("mongodb+srv://Ifetayo:Olanrewaju2012@cluster0.5hskv9a.mongodb.net/Challenge")
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
    });
app.post('/api/tasks', async (req, res, next) => {
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
            data: savedTask
        });
    } catch (err) {
        next(err); 
    }
});


app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
  
    res.status(statusCode).json({
        success: false,
        error: message
    });
});

app.listen(7000, () => { 
    console.log(`Server is running on port 7000`);
});