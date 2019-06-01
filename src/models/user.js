const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Please provide a valid email');
            }
        }
    }, 
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if(value < 0) {
                throw new Error('Age must be  positive number');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate(value) {
            if(value.includes('password')) {
                throw new Error("Password cannot contain 'password' in it");
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true
});

userSchema.methods.toJSON = function () {
    const user = this;
    const responseData = user.toObject();
    delete responseData.password;
    delete responseData.tokens;
    return responseData;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({_id: user._id}, 'nodejstask');
    user.tokens = user.tokens.concat({token});
    await user.save();
    return token;
}

userSchema.statics.findUser = async (email, password) => {
    const user = await User.findOne({email});
    if (!user) {
        throw new Error('Invalid login request');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if(!isValid) {
        throw new Error('Invalid login request');
    }
    return user;
}

userSchema.pre('save', async function (next) {
    const user = this;
    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;