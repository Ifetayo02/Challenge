const express=require('express');
const router=express.Router();
const todosController=require('../controllers/todosControllers');
router.get('/',todosController.getAllTodos);
router.get('/:id',todosController.getTodoById);
router.post('/',todosController.createTodo);
router.put('/:id',todosController.editTodo);
router.delete('/:id',todosController.deleteTodo)
module.exports=router;
