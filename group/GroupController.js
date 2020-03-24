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


var mongoose = require('mongoose');
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const path = require("path");

// DB
// const mongoURI = 'mongodb://localhost:27017/mydb_media';
const mongoURI = "mongodb://localhost:27017/node-file-upl";

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// init gfs
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads"
  });
});


// Storage
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString("hex") + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: "uploads"
          };
          resolve(fileInfo);
        });
      });
    }
  });
  
  const upload = multer({
    storage
  });

//register a group
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


//edit group info
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

//delete group
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

// router.get('/', function (req, res) {
//     Group.find({}, function (err, group) {
//         if (err) return res.status(500).send("There was a problem finding the groups.");
//         res.status(200).send(group);
//     });
// });


//get group info
router.get('/info/:id', function(req, res, next) {

    Group.findById(req.params.id, function (err, group) {
      if (err) return res.status(500).send("There was a problem finding the group.");
      if (!group) return res.status(404).send("No group found.");
      res.status(200).send(group);
    });
  
  });




  //upload to group
  //add admin
  //fetch downlod list

  router.post("/upload/:id", VerifyToken, upload.single("file"), (req, res) => {
    console.log({file : req.file});
    // res.json({file : req.file})
    // res.redirect("/");
    res.status(200).send("success");
  });
  
  router.get("/media/:filename", VerifyToken, (req, res) => {
    // console.log('id', req.params.id)
    const file = gfs
        .find({
        filename: req.params.filename
        })
        .toArray((err, files) => {
        if (!files || files.length === 0) {
            return res.status(404).json({
            err: "no files exist"
            });
        }
        gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        });
  });

  
router.get("/media", VerifyToken, (req, res) => {
    const file =gfs.find().toArray((err, files) => {
        // check if files
        if (!files || files.length === 0) {
        return res.status(404).json({
            err: "no files exist"
        });
        }

        return res.json(files);
    });
});
    
  
router.post("/media/del/:id", VerifyToken, (req, res) => {
gfs.delete(new mongoose.Types.ObjectId(req.params.id), (err, data) => {
    if (err) return res.status(404).json({ err: err.message });
    // res.redirect("/");
    res.status(200).send("success");
});
});
    /////////////////////////////////
  
module.exports = router;