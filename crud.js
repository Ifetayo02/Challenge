const express=require('express');
const app=express();
const config=require('./config/config')
const todosRoutes=require('./routes/todosRoutes')
app.use(express.json());

app.use('/todos',todosRoutes)

app.listen(config.PORT,()=>{
    console.log(`Server is running on port ${config.PORT}`);
})