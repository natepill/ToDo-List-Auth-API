const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

// jwt.sign takes adds secret to token
// jwt.verify makes sure that token's data wasnt changed


var data = {
    id: 10
}

var token = jwt.sign(data, '123abc') //what we send back to the user when they sign up/in. Add this token to the tokens array in the User Model

console.log(token);

// jwt: header, payload, secret

var decoded = jwt.verify(token, '123abc')
console.log('decoded', decoded);


// var message = 'I am user 3';
// var hash = SHA256(message).toString()
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);
//
// //Hashing is a one way algorithm: Can encrypt, but not decrypt
//
// //data that we want to send back from the server to the client
// //Id lets us know which user allow to make a request
// var data = {id: 4}
//
// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'some secret').toString()
//
// }
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'some secret').toString()
//
// //Ensure that hashing is working
// if (resultHash === token.hash){
//     console.log('data was not changed');
// }else{
//     console.log('data was changed, BEWARE!');
// }
