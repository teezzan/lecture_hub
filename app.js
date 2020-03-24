var express = require('express');
var app = express();
var db = require('./db');
global.__root   = __dirname + '/'; 


// // Middlewares
// app.use(express.json());
// app.set("view engine", "ejs");


app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var UserController = require(__root + 'user/UserController');
app.use('/api/users', UserController);

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);


var GroupController = require(__root + 'group/GroupController');
app.use('/api/group', GroupController);

module.exports = app;