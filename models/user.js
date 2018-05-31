var mongoose = require('mongoose');
var bcrypt = require('bcrypt');


//User Schema
const UserSchema = new mongoose.Schema({
    fullname: {
        type:String,
        unique: false,
        required: true,
        trim:true
    },
    email: {
        type:String,
        unique: true,
        required: true,
        trim:true
    },
    password: {
        type:String,
        required: true,       
    },
    passwordMatch: {
        type:String,
        required: true,
    },
    username: {
        type:String,
        unique: true,
        required: true,
        trim:true
    },

});

 //Authenticate input against database
 UserSchema.statics.authenticate = function(username, password, callback) {
    User.findOne({username: username}).exec (function(err, user) {
        if(err) {
            return callback(err)
        }else if(!user){
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result) {
            if(result === true) {
                return callback(null, user);
            }else {
                return callback();
            }
        });
    });
}

//Hashing a password before saving it to the database
UserSchema.pre('save', function(next) {
    var user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if(err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
 });

 var User = module.exports = mongoose.model('User', UserSchema);
   