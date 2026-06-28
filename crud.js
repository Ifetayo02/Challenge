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



eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhNDAzOTBlNGEzMjQ5MDVkODc1ZDQ5ZiIsImVtYWlsIjoiYW1pbmEudXBsb2FkQHRlc3QuY29tIiwiaWF0IjoxNzgyNjU3MDU5LCJleHAiOjE3ODI2NTc5NTl9.veWHlLVYCI3YtOsbfZRB2r6cEc13q4I6fHw8nS7_ZLs