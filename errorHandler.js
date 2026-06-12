const express = require('express');
const app = express();

app.use(express.json());
const Todos={
    data:[],
    create:async function(todoData){
        const newRecord={       
        _id:`db_id_${Math.random().toString(36).substr(2, 9)}`,
        ...todoData
    };
    this.data.push(newRecord);
    return newRecord;
}};

app.post('/tasks', async (req, res, next) => {
    try {
        const { title, description } = req.body;
        if (!title || title.trim() === "") {
            const error = new Error('Title is required');
            error.statusCode = 400;
            return next(error);
        }
        const newTodo = await Todos.create({
            title,
            description: description || ""
        });
        res.status(201).json({
            success: true,
            data: {
                id: newTodo._id,
                title: newTodo.title,
                description: newTodo.description
            }
        });
    } catch (error) {
        next(error);
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});