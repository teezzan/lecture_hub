var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var VerifyToken = require('./VerifyToken');
var VerifyTokenExt = require('./VerifyTokenExt');
var crypto = require('crypto');
var cors = require('cors');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


/**
 * @swagger
 * definitions:
 *   User:
 *     required:
 *       - email
 *       - password
 *     properties:
  *       _id:
 *         type: string
 *         example: 5e9cdd83e4d51f18624c7753
 *       name:
 *         type: string
 *         example: John Doe
 *       email:
 *         type: string
 *         example: JohnDoe@mail.com
 *       sub:
 *         type: array
 *         example: [5e9cdd83e4d51f18624c7753, 4d51f18625e9cdd83e4c7753]
 *       verified:
 *         type: boolean
 *         example: true
 *       blocked:
 *         type: boolean
 *         example: false  
 */



function send_mail(recipient, x) {
  const transporter = nodemailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
      rejectUnauthorized: false
    },
  });

  var message = {
    from: 'noreply@halqah.com',
    to: `${recipient}@localhost.com`,
    subject: 'Confirm Email',
    text: 'Please confirm your email',
    html: `${x}`
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
}

/**
 * @swagger
 *
 * /auth/login:
 *   post:
 *     description: Login to the application
 *     summary: Login a user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: local@gmail.com
 *             password:
 *               type: string
 *               format: password
 *               example: local1234
 *         required:
 *           - email
 *           - password
 *     responses:
 *       200:
 *         description: login
 *         schema:
 *           type: object
 *           properties:
 *             auth:
 *               type: boolean
 *               example: true
 *             token:
 *               type: string
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOTViYjE4MzE2YTliMWM1ZjYwYjdjMiIsImlhdCI6MTU4Njg5ODg3MywiZXhwIjoxNTg2ODk5NzczfQ.NlvxeIlJRQMytm-rFyz5sJjaDc5SO37bKJu2C6ny_pE
 *       500:
 *         description: login failed
 *         schema:
 *           type: object
 *           properties:
 *             auth:
 *               type: boolean
 *               example: false
 *             token:
 *               type: string
 *               example: null
 *         
 */


router.post('/login', cors(), function (req, res) {
  console.log(req);
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');

    // check if the password is valid
    var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordIsValid) return res.status(401).send({ auth: false, token: null });

    // if user is found and password is valid
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 86400 // expires in 24 hours
    });

    // return the information including token as JSON
    res.status(200).send({ auth: true, token: token });
  });

});

/**
 * @swagger
 *
 * /auth/logout:
 *   get:
 *     description: Logout the user from the application
 *     summary: Logout a user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *         description: Logout Successful
 *         schema:
 *           type: object
 *           properties:
 *             auth:
 *               type: boolean
 *               example: false
 *             token:
 *               type: string
 *               example: null
 *       500:
 *         description: Internal Error
 *         
 *         
 */

router.get('/logout', cors(), function (req, res) {
  res.status(200).send({ auth: false, token: null });
});

/**
 * @swagger
 *
 * /auth/register:
 *   post:
 *     description: Register User to the application
 *     summary: Register a user
 *     tags:
 *       - Users
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             password:
 *               type: string
 *               format: password
 *         required:
 *           - name
 *           - email
 *           - password
 *     responses:
 *       200:
 *         description: registration successful. Verification email sent
 *       500:
 *         description: registration failed
 *       401:
 *         description: email required
 *         
 */


router.post('/register', cors(), function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  },
    function (err, user) {
      if (err) return res.status(500).send("There was a problem registering the user.");

      // if user is registered without errors
      // create a token
      const token = crypto.randomBytes(20).toString('hex');

      User.findByIdAndUpdate(user._id, { resetPasswordToken: token, resetPasswordExpires: (Date.now() + 36000000) }, { new: true }, function (err, user) {
        if (err) return res.status(500).send("There was a problem setting up verification.");

        //send email
        // var link = `http://localhost:3000/api/auth/verify/${token}`;
        var link = `halqah.herokuapp.com/api/auth/verify/${token}`;
        // send_mail(user.email, `<div><h2><b> Verify your Account </b></h2> <hr></br>	<p>You attempted to Create an Halqoh account.</br>Click <a href="${link}"><input type="button" value="Here"></a> to verify your email.<hr>If you did not attempt to create an Halqoh account, kindly ignore. <br>Thank you.</p></div>`);
        res.status(200).send(`Verification link is ${link}`);
      });
    });
});


/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags:
 *       - Users
 *     name: Get User details
 *     summary: Get User Details
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: A single user object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 *       '401':
 *         description: No auth token / no user found in db with that name
 *       '403':
 *         description: JWT token and username from client don't match
 */

router.get('/me', cors(), VerifyToken, function (req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

/**
 * @swagger
 * /auth/verify:
 *   get:
 *     tags:
 *       - Users
 *     name: Verifiy user email
 *     summary: Helps verify user email during signup
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required:
 *           - token
 *     responses:
 *       '200':
 *         description: Verification Successful
 *       '401':
 *         description: No auth token
 *       '404':
 *         description: No Such User found
 */

router.get('/verify/:key', cors(), function (req, res) {
  User.findOneAndUpdate({
    resetPasswordToken: req.params.key, resetPasswordExpires: { $gte: Date.now() }
  }, { verified: true, resetPasswordExpires: null, resetPasswordToken: null }, function (err, user) {
    if (err) return res.status(500).send("Invalid token.");
    if (!user) return res.status(404).send("No Such User found.");
    res.status(200).send("Email Verification Successful. Login With your details");
  });
});


/**
 * @swagger
 * /auth/forget-password:
 *   post:
 *     tags:
 *       - Users
 *     name: Retrieving User account
 *     summary: For Retrieving User account. Email is sent to registered mail
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: YusufT@gmail.com
 *         required:
 *           - email
 *     responses:
 *       '200':
 *         description: Retrival link sent to Email
 *       '500':
 *         description: Internal Error
 *       '403':
 *         description: User not found
 */

router.post('/forget-password', cors(), function (req, res) {
  if (req.body.email === '') {
    return res.status(400).send('email required');
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');


    // if user is found 
    // // create a token
    const token = crypto.randomBytes(20).toString('hex');

    User.findByIdAndUpdate(user._id, { resetPasswordToken: token, resetPasswordExpires: (Date.now() + 36000000) }, { new: true }, function (err, user) {
      if (err) return res.status(500).send("There was a problem retriving account.");


      // return the information including token as JSON
      var link = `halqah.herokuapp.com/api/auth/reset/${token}`;
      // send_mail(user.email, `<div><h2><b> Reset Your Password </b></h2>	<p>You attempted to change the Password for your Halqoh account.\n\nClick <a href="${link}"><input type="button" value="Here"></a> and You will be redirected to a page where you can change your Password.<hr>If you did not request to change your Password, kindly ignore. <br>Thank you.</p></div>`);
      res.status(200).send(`Sent to Email ===> ${link}`);
    });
  });

});


/**
 * @swagger
 * /auth/reset/{resetPasswordToken}:
 *   get:
 *     tags:
 *       - Users
 *     name: Check Token Authenticity
 *     summary: Helps to Check Token Authenticity before password change is allowed
 *     parameters:
 *       - in: path
 *         name: resetPasswordToken
 *         schema:
 *           type: string
 *           example: 670a7c7e5eea7dd52c70e0fd575147af21b64af9
 *         required:
 *           - resetPasswordToken
 *     responses:
 *       '200':
 *         description: Token Active
 *       '500':
 *         description: Internal server error
 *       '403':
 *         description: Token Expired.
 */

router.get('/reset/:key', cors(), function (req, res) {
  console.log(req.params.key);
  User.findOne({
    resetPasswordToken: req.params.key, resetPasswordExpires: { $gte: Date.now() }
  }, function (err, users) {
    if (err) return res.status(500).send(err.message);
    if (!users) return res.status(500).send("Token expired");
    res.status(200).send(`token active`);
  });
});


/**
 * @swagger
 * /auth/finduser/{id}:
 *   get:
 *     tags:
 *       - Users
 *     name: Find user
 *     summary: Finds a user
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 *     responses:
 *       '200':
 *         description: A single user object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 *       '500':
 *         description: Internal server error
 *       '403':
 *         description: No user found.
 */

router.get('/finduser/:id', cors(), function (req, res) {
  User.findById(req.params.id, { password: 0, resetPasswordExpires: 0, resetPasswordToken: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });
});


/**
 * @swagger
 *
 * /auth/reset:
 *   put:
 *     description: Change User Password with token
 *     summary: Used to Change User Password with token sent to the mail
 *     tags:
 *       - Users
 *     parameters:
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             resetPasswordToken:
 *               type: string
 *               example: 670a7c7e5eea7dd52c70e0fd575147af21b64af9
 *             password:
 *               type: string
 *               format: password
 *               example: passqwert1234
 *         required:
 *           - resetPasswordToken
 *           - password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       500:
 *         description: There was a problem changing password."
 *       400:
 *         description: email required
 *         
 */


router.put('/reset', cors(), function (req, res) {
  if (req.body.password === '') {
    return res.status(400).send('password cannot be empty');
  }
  var hashedPassword = bcrypt.hashSync(req.body.password, 8);
  User.findOneAndUpdate({
    resetPasswordToken: req.body.resetPasswordToken, resetPasswordExpires: { $gte: Date.now() }
  }, { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
    function (err, users) {
      if (err) return res.status(500).send("There was a problem changing password.");
      if (!users) return res.status(500).send("User not found.");
      res.status(200).send("Password changed successfully");
      return;
    });



});




module.exports = router;