var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
var VerifyToken = require('./VerifyToken');
var VerifyTokenExt = require('./VerifyTokenExt');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file


function send_mail(x){
  const transporter = nodemailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
      rejectUnauthorized: false
    },
  });

  var message = {
    from: 'noreply@halqah.com',
    to: 'whatever@localhost.com',
    subject: 'Confirm Email',
    text: 'Please confirm your email',
    html: `<p>Please confirm your email with ${x}</p>`
  };

  transporter.sendMail(message, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
  });
}



router.post('/login', function(req, res) {

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

router.get('/logout', function(req, res) {
  res.status(200).send({ auth: false, token: null });
});

router.post('/register', function(req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.create({
    name : req.body.name,
    email : req.body.email,
    password : hashedPassword
  }, 
  function (err, user) {
    if (err) return res.status(500).send("There was a problem registering the user.");

    // if user is registered without errors
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 900 // expires in 15 minutes
    });
    //send email
    var link = `http://localhost:3000/api/auth/verify/${token}`;
    send_mail(`<div><h2><b> Verify your Account </b></h2> <hr></br>	<p>You attempted to Create an Halqoh account.</br>Click <a href="${link}"><input type="button" value="Here"></a> to verify your email.<hr>If you did not attempt to create an Halqoh account, kindly ignore. <br>Thank you.</p></div>`);
    res.status(200).send("Verification link Sent to Email");
  });

});

router.get('/me', VerifyToken, function(req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

router.get('/verify/:key', VerifyTokenExt, function(req, res) {
  console.log("req.userId");
  User.findByIdAndUpdate(req.userId, {verified : true}, {new: true}, function (err, user) {
    if (err) return res.status(500).send("Invalid Request.");
    if (!user) return res.status(404).send("No Such User found.");
    res.status(200).send("Email Verification Successful. Login With your details");
  });

});

router.get('/forget-password/:email', function(req, res) {

  User.findOne({ email: req.params.email }, function (err, user) {
    if (err) return res.status(500).send('Error on the server.');
    if (!user) return res.status(404).send('No user found.');
    

    // if user is found 
    // create a token
    var token = jwt.sign({ id: user._id }, config.secret, {
      expiresIn: 900 // expires in 15 mins
    });

    // return the information including token as JSON
    //send_email_template({ auth: true, token: token })
    var link = `http://localhost:3000/api/auth/ret-pass/${token}`;
    send_mail(`<div><h2><b> Reset Your Password </b></h2>	<p>You attempted to change the Password for your Halqoh account.Click <a href="${link}"><input type="button" value="Here"></a> and You will be redirected to a page where you can change your Password.<hr>If you did not request to change your Password, kindly ignore. <br>Thank you.</p></div>`);
    res.status(200).send("Sent to Email");
    // res.status(200).send({ auth: true, token: token });
  });

});

router.get('/ret-pass/:key', VerifyTokenExt, function(req, res) {
  console.log("redirecting");
  //redirect and probably make new token (short one)
  res.status(200).send("redirecting to password page");

});

router.get('/:id', function (req, res) {
  User.findById(req.params.id, { password: 0 }, function (err, user) {
      if (err) return res.status(500).send("There was a problem finding the user.");
      if (!user) return res.status(404).send("No user found.");
      res.status(200).send(user);
  });
});

router.put('/ret-pass/:key', VerifyTokenExt, function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findByIdAndUpdate(req.userId, {password : hashedPassword}, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem changing password.");
    res.status(200).send("Password changed successfully");
    return;
  });



});




module.exports = router;