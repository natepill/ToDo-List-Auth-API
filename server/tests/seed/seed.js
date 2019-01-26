const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')
const {Todo} = require('./../../models/todo')
const {User} = require('./../../models/user')

const userOneId = new ObjectID();
const userTwoId = new ObjectID();


//Two users. One with valid auth tokens. One without valid auth tokens.
const users = [{
  _id: userOneId,
  email: 'andrew@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};


//populate database with users
const populateUsers = (done) => {
    User.remove({}).then(() =>{

        //By calling save we are running through our middleware through the pre save UserSchema method
        var userOne = new User(users[0]).save();
        var userTwo = new User(users[1]).save();

        //Wait till both users have been saved
        return Promise.all([userOne, userTwo])

    //return Promise all so we can tag a .then below
    }).then(() => done());

};


module.exports = {todos, populateTodos, users, populateUsers};
