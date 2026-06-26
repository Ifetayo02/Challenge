const express=require('express');
const app=express();
const config=require('./config/config')
const todosRoutes=require('./routes/todosRoutes')
app.use(express.json());

app.use('/todos',todosRoutes)

app.listen(config.PORT,()=>{
    console.log(`Server is running on port ${config.PORT}`);
})
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2VhNDE2MGJlZjg3MDJhZWE5OGZiMyIsImVtYWlsIjoiYW1pbmFAdGVzdC5jb20iLCJpYXQiOjE3ODI0OTAxNzIsImV4cCI6MTc4MjQ5MTA3Mn0.VNqgn9IZZF3xnGZ8vNrlCw6yQVCOYcoJCj0_dxXLAHg