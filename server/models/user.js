const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

var UserSchema = new mongoose.Schema({
      email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true, //No two users can have the same email
        validate: {
          validator: validator.isEmail,
          message: '{VALUE} is not a valid email'
        }
      },
      password: {
        type: String,
        require: true,
        minlength: 6
      },
      tokens: [{
        access: {
          type: String,
          required: true
        },
        token: {
          type: String,
          required: true
        }
      }]
    }); //NOW we can create model methods because we have a Schema. Using same properties as from the User Model

UserSchema.methods.toJSON = function(){ //Helps to hide private user info
    var user = this;
    var userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};


//adding instance methods to the UserSchema object's methods property
UserSchema.methods.generateAuthToken() = function(){
    var user = this; // Makes clear what we're manipulating. 'user' is a recognizable variable
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString()

    user.tokens = user.tokens.concat([{access, token}]);

    return user.save().then(() => {
        return token; //Token is not a Promise, but we can still chain another 'then' call. I THINK because we are returning the user.save()
    })
}


var User = mongoose.model('User', UserSchema);

module.exports = {User}
