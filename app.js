var express = require('express');
var app = express();
var db = require('./db');
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUi = require('swagger-ui-express');
global.__root   = __dirname + '/'; 


// // Middlewares
// app.use(express.json());
// app.set("view engine", "ejs");





const swaggerDefinition = {
  info: {
    title: 'Halqoh Swagger API',
    version: '1.0.0',
    description: 'Endpoints to test the app routes',
  },
  host: 'halqah.herokuapp.com',
  basePath: '/api',
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'x-token-access',
      scheme: 'bearer',
      in: 'header',
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./auth/*.js', './group/*.js', './user/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));





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