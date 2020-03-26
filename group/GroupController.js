var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');

var VerifyToken = require('../auth/VerifyToken');
var VerifyAdmin = require('../auth/VerifyAdmin');


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
        admin : JSON.stringify([req.userId]),
        media : "[]"
      }, 

      function (err, group) {
        if (err) return res.status(500).send("There was a problem creating the group`.");
        console.log(group);
        res.status(200).send(group);
      });
    
});


//edit group info
router.put('/:id',  VerifyToken, VerifyAdmin, function (req, res) {
    

    Group.findOne({ _id: req.params.id }, function (err, group) {
    // Group.findById(req.params.id, function (err, group) {
        if (err) return res.status(500).send("There was a problem finding the group.");
        
        if (!group) { 
            res.status(404).send("No group found.");
            return;}
            
        if (!(JSON.parse([group.admin]).includes(req.userId))) { 
            res.status(401).send("You have no authorization");
            return;}
         delete req.body.upload;
         delete req.body.admin;
        Group.findByIdAndUpdate(req.params.id, req.body , {new: true}, function (err, group) {
            if (err) return res.status(500).send("There was a problem updating the group.");
                res.status(200).send(group);
                return;
        });    

        });
        
    

});

//delete group
router.delete('/:id', VerifyToken, VerifyAdmin, function (req, res) {
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


//vanilla upload or not
router.post("/upload/:id", VerifyToken, VerifyAdmin, upload.single("file"), (req, res) => {
    // res.json({file : req.file})
    // res.redirect("/");
    console.log(req);
    var file_info = {
      title : req.body.title,
      id : req.file.id,
      filename : req.file.filename,
      content_type : req.file.contentType,
      upload_date : req.file.uploadDate,
      size : req.file.size
    }
    
    // console.log(file_info);

    Group.findOne({ _id: req.params.id }, function (err, group) {
      // Group.findById(req.params.id, function (err, group) {
          if (err) return res.status(500).send("There was a problem finding the group.");
          
          if (!group) { 
              res.status(404).send("No group found.");
              return;}
          
          group.media.push(file_info)
          
          Group.findByIdAndUpdate(req.params.id, {media : group.media}, {new: true}, function (err, groups) {
              if (err) return res.status(500).send("There was a problem updating the group.");
                res.status(200).send(groups);
                return;
          });    
  
          
          });


    
  });
  

 //Vanilla for getting and downloading from common repo 
router.get("/media/:filename", VerifyToken, (req, res) => {
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


  
 //get list of media vanilla. not exposed
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
    
// vanilla delete... To make another for deleting stuff on group
router.post("/media/del/:id", VerifyToken, VerifyAdmin, (req, res) => {

  Group.findOne({ _id: req.params.id }, function (err, group) {
    // Group.findById(req.params.id, function (err, group) {
        if (err) return res.status(500).send("There was a problem finding the group.");
        
        if (!group) { 
            res.status(404).send("No group found. Delete failed");
            return;}
        
        if((group.media.length > req.body.index) && (group.media[req.body.index].id == req.body.media_id)){
            group.media.splice(req.body.index, 1);}
        else{return res.status(500).send("File does not match");}
        
        Group.findByIdAndUpdate(req.params.id, {media : group.media}, {new: true}, function (err, groups) {
            if (err) return res.status(500).send("There was a problem updating the group.");


            gfs.delete(new mongoose.Types.ObjectId(req.body.media_id), (err, data) => {
                if (err) return res.status(404).json({ err: err.message });
                // res.redirect("/");
                
                res.status(200).send(" Deleted file succssfully");
            });
    
        });    
});






    
});
    /////////////////////////////////
  
module.exports = router;