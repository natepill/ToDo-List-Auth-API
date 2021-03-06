require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({_creator: req.user._id}).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne(_id: id, _creator: req.user._id).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  //Changed mongoose query from findById to FindOne so we can specify which user to delete Todo from
  Todo.findOneAndRemove({_id: id, _creator: req.user._id}}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});

// POST /users

app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']); //lodash pick method. Prevents any access to modifying token array
  var user = new User(body);

  user.save().then(() => {
     return user.generateAuthToken();

    }).then((token) => {
        res.header('x-auth', token).send() //setting x-auth custom header
    }).catch((e) => {
        res.status(400).send(e);
      })
    });


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});



//Dedicated Route for logging in users
//req: {email, password} --> Need to find user with email and hashed password
app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
      //Found user, now generate an auth token
      //We return this result to continue the chain, if there is an error, the catch is triggered
      return user.generateAuthToken().then((token) =>{
          //respond with x-auth header along with token and send back user object
          res.header('x-auth', token).send(user);
      });

  }).catch((e) => {
      res.status(400).send();
  });
});

//Trying to delete the token off the currently logged in user
app.delete('/users/me/token', authenticate, (req, res) => {
    //dont need any data back, just need to know if it was deleted, thats why no data passed though the .then()
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
});







app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

module.exports = {app};
