const User=require('../models/userModel');
const registerUser=async(req,res,next)=>{
    try{
    const{name,email,password}=req.body;
    const userExists= await User.findOne({email});
    if (userExists){
        const error=new Error ('User with this email already exists');
        error.statusCode=400;
        return next(error)
    }
const newUser=await User.create({name,email,password});
const userResponse=new User.toObject();
delete userResponse.password;
res.status(201).json({
            success: true,
            data: userResponse
        })
    }catch (error) {
          if (!error.statusCode) error.statusCode = 400
        next(error);
    }
}
module.exports = { registerUser };