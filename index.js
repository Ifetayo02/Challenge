require('dotenv').config();
const express=require('express');
const app=express();
const router=express.Router();
const tasks=[
    {
        id:1,
        title:'learn raw node.js'
    },
    {
        id:2,
        title:'learn express.js'
    },
    {
        id:3,
        title:'Get familiar with requests type'

    }
]

router.get('/',(req,res)=>{
    res.json(tasks);
})
router.get('/:id',(req,res)=>{
    const id=parseInt(req.params.id,10);
    const task=tasks.find(task=>task.id===id);
    if (!task) {
        return res.status(404).json({message:'Task not found'});
    }res.json(task);
})
const port=process.env.PORT || 5634;

app.use('/tasks',router);
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})