const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    token: String,
    expires: Date,
    image: String
});

//Hash passwords method

usersSchema.pre('save', async function(next){
    //If the password has already been hashed, do nothing
    if(!this.isModified('password')){
        return next(); //Stop the execution
    }
    //If not hashed
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

//Send an alert when a user is already registered
usersSchema.post('save', function(error, doc, next){
    if(error.name === 'MongoServerError' && error.code === 11000){
        next('The email provided is already registered');
    }else{
        next(error);
    }
});

//User authentication

usersSchema.methods = {
    comparePasswords: function(password){
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Users', usersSchema);