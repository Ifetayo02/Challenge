let todos=[
    {
        id:1,
        title:'learn raw node.js',
        completed:'true'
    },
    {
        id:2,
        title:'learn express.js',
          completed:'true'
    },
    {
        id:3,
        title:'Get familiar with requests type',
          completed:'true'
    },
    {
        id:4,
        title:'learn how to use .env file',
          completed:'true'  
    },
    {
        id:5,
        title:'learn how to use nodemon',
          completed:'true'
    }
];
const getAllTodos= (req,res)=>{
    res.json(todos);
};
const getTodoById= (req,res)=>{
    const id=parseInt(req.params.id,10);
    const todo=todos.find(todo=>todo.id===id);
    if (!todo) {
        return res.status(404).json({message:'Task not found'});
    }
    res.json(todo);
};

const editTodo= (req,res)=>{
     const id=parseInt(req.params.id,10);
    const todo=todos.find(todo=>todo.id===id);
    if(!todo){
        return res.status(404).json({message:'Task not found'});
    }
    if (req.body.id !== undefined)todo.id=req.body.id;
    if (req.body.title !== undefined)todo.title=req.body.title;
    if (req.body.completed !== undefined)todo.completed=req.body.completed;
    res.json(todo);
};
const deleteTodo= (req,res)=>{
    const id=parseInt(req.params.id,10);
    const todoIndex=todos.findIndex(todo=>todo.id===id);
    if(todoIndex===-1){
        return res.status(404).json({message:'Task not found'});
    }
    todos.splice(todoIndex,1);
    res.json({message:'Task deleted successfully'});
};
module.exports={
    getAllTodos,
    getTodoById,
    createTodo,
    editTodo,
    deleteTodo
}