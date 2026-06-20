const mongoose = require('mongoose');
const bcrypt=require('bcryptjs')
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required:[true,'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase:true
    },
    password:{
            type: String,
        required: [true, 'Password is required'],
    }
},
{
    timestamps: true
}
);
userSchema.pre('save', async function (next) {
    if (!this.isModified('password'));
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});
module.exports = mongoose.model('User', userSchema);