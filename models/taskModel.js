const mongoose=require('mongoose')
const taskSchema=new mongoose.Schema({
    title:{
        type:String,
        required :[true, 'Title is required'],
        trim:true
    },
    description:{
        type:String,
        required :[true, 'Description is required'],
        trim:true
    },
    status:{
        type:String,
        enum:['pending','in-progress','completed'],
        message:`{VALUE} is not a valid status`,
        default:'pending'
    }},{timestamps:true});
module.exports=mongoose.model('Task',taskSchema)
