var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('../auth/VerifyToken');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../user/User');
var Group = require('./Group');

/**
 * Configure JWT
 */
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var bcrypt = require('bcryptjs');
var config = require('../config'); // get config file

router.post('/register', VerifyToken, function(req, res) {


    Group.create({
        name : req.body.name,
        description : req.body.description,
        admin : JSON.stringify([req.userId])
      }, 

      function (err, group) {
        if (err) return res.status(500).send("There was a problem creating the group`.");
        
        res.status(200).send(group);
      });
    
});



router.put('/:id',  VerifyToken, function (req, res) {
    

    Group.findOne({ _id: req.params.id }, function (err, group) {
    // Group.findById(req.params.id, function (err, group) {
        if (err) return res.status(500).send("There was a problem finding the group.");
        
        if (!group) { 
            res.status(404).send("No group found.");
            return;}
            
        if (!(JSON.parse([group.admin]).includes(req.userId))) { 
            res.status(401).send("You have no authorization");
            return;}
        // delete req.body.admin;
        Group.findByIdAndUpdate(req.params.id, req.body , {new: true}, function (err, group) {
            if (err) return res.status(500).send("There was a problem updating the group.");
                res.status(200).send(group);
                return;
        });    

        });
        
    

});


router.delete('/:id', VerifyToken, function (req, res) {
    Group.findById(req.params.id, function (err, group) {
        if (err) return res.status(500).send("There was a problem finding the group.");
        if (!group) return res.status(404).send("No group found.");
        if (!(JSON.parse([group.admin]).includes(req.userId))) return res.status(401).send("You have no authorization");
        
      

        Group.findByIdAndRemove(req.params.id, function (err, group) {
            if (err) return res.status(500).send("There was a problem deleting the group.");
            res.status(200).send("group: "+ group.name +" was deleted.");
        });
});
});

router.get('/', function (req, res) {
    Group.find({}, function (err, group) {
        if (err) return res.status(500).send("There was a problem finding the groups.");
        res.status(200).send(group);
    });
});

router.get('/:id', function(req, res, next) {

    Group.findById(req.params.id, function (err, group) {
      if (err) return res.status(500).send("There was a problem finding the group.");
      if (!group) return res.status(404).send("No group found.");
      res.status(200).send(group);
    });
  
  });


  //upload to group
  //add admin
  //fetch downlod list

module.exports = router;