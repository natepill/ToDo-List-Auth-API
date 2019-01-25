var {User} = require('./../models/user');


var authenticate = (req, res, next) => {  //middleware to authenticate users

    var token = req.header('x-auth');

    User.findByToken(token).then((user) => {
        if (!user){
            return Promise.reject() //sends us straight to catch block
        }

        req.user = user; //instead of sending back user, we set req.user to user found
        req.token = token;

        next();

    }).catch((e) => {
        res.status(401).send()
        //Not calling next() because we dont want to send back user if none found
    })


};

module.exports = {authenticate}
