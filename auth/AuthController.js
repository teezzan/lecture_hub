var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('./VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

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
    res.status(200).send({ auth: true, token: token });
  });

});

router.get('/me', VerifyToken, function(req, res, next) {

  User.findById(req.userId, { password: 0 }, function (err, user) {
    if (err) return res.status(500).send("There was a problem finding the user.");
    if (!user) return res.status(404).send("No user found.");
    res.status(200).send(user);
  });

});

router.get('/verify', VerifyToken, function(req, res) {
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
    res.status(200).send("Sent to Email");
    // res.status(200).send({ auth: true, token: token });
  });

});

router.get('/ret-pass', VerifyToken, function(req, res) {
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

router.put('/ret-pass', VerifyToken, function (req, res) {

  var hashedPassword = bcrypt.hashSync(req.body.password, 8);

  User.findByIdAndUpdate(req.userId, {password : hashedPassword}, { new: true }, function (err, user) {
    if (err) return res.status(500).send("There was a problem changing password.");
    res.status(200).send("Password changed successfully");
    return;
  });



});


module.exports = router;