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
    },
avatarUrl: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg' 
},
refreshToken: {
    type: String
}
},
{
    timestamps: true
}
);
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);