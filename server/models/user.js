const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs')

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
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
UserSchema.methods.generateAuthToken = function () {
  var user = this; // Makes clear what we're manipulating. 'user' is a recognizable variable
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

  user.tokens = user.tokens.concat([{access, token}]);

  return user.save().then(() => {
     return token; //Token is not a Promise, but we can still chain another 'then' call. I THINK because we are returning the user.save()
  });
};

//Everything added to 'statics' turns into a model method instead of an instance method
UserSchema.statics.findByToken = function (token) {
    var User = this;
    var decoded; //wil store the decoded jwt values (return result from jwt.verify)

    try{
        decoded = jwt.verify(token, 'abc123')
    }catch(e){

        return Promise.reject(); //we could pass in a value that would be used in our catch block in the controller

        //return a Promise that is always going to reject
        //if this code runs, we don't want the following returning of findOne User
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
        // We use dot operator and wrap values in quotes to access nested attributes
        //qoutes are REQUIRED when using you have a '.' in the value
    });
};

// If you do NOT provide 'next' parameter and do not call it the middleware wont complete and program will crash
UserSchema.pre('save', function(next){
    var user = this

    //We only want to hash when a user is created or password is modifying, otherwise we are hashing a hash
    //isModified takes an individual property and returns Boolean value
    if (user.isModified('password')){

        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            })
        })
    }else{
        next();
    }
});




var User = mongoose.model('User', UserSchema);

module.exports = {User}
