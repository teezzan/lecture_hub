var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors')

var VerifyToken = require('../auth/VerifyToken');
var VerifyAdmin = require('../auth/VerifyAdmin');
var VerifyUser = require('../auth/VerifyUser');


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
// const db = process.env.MONGODB_URL;
const mongoURI = 'mongodb+srv://adminlove:t%40ye1234@cluster0-sbitd.mongodb.net/test?retryWrites=true&w=majority';
// const mongoURI = "mongodb://localhost:27017/node-file-upl";

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


/**
 * @swagger
 * definitions:
 *   Group:
 *     required:
 *       - name
 *     properties:
  *       _id:
 *         type: string
 *         example: 5e9cdd83e4d51f18624c7753
 *       name:
 *         type: string
 *         example: KBC Lagos
 *       description:
 *         type: string
 *         example: A monthly Sitting in Lagos for Students of Knowlege
 *       sub:
 *         type: array
 *         description: array of id of users that subscribed to the channel
 *         example: [5e9cdd83e4d51f18624c7753, 4d51f18625e9cdd83e4c7753]
 *       media:
 *         type: array
 *         description: array of Media(Uploads) Object for fetch from common Storage
 *         example: []
 *       blocked:
 *         type: boolean
 *         example: false  
 */


function remove_media(value, index, array) {
  delete value.media;
  console.log(value);
  return value;
}

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


/**
 * @swagger
 *
 * /group/register:
 *   post:
 *     description: Create a Channel
 *     summary: Create a Channel on the app
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
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
 *               example: JWMBC Weekly Lecture
 *             description:
 *               type: string
 *               example: A Lagos weekly Lecture focused on Nikkah
 *         required:
 *           - name
 *           - description
 *     responses:
 *       200:
 *         description: Channel Created Successfully
 *       500:
 *         description: Internal Error
 *       401:
 *         description: Unique Name required
 *         
 */


//register a group
router.post('/register', VerifyToken, function (req, res) {

  if (req.body.name === '' || req.body.description === '') {
    return res.status(400).send('Data Incomplete');
  }

  Group.create({
    name: req.body.name,
    description: req.body.description,
    admin: JSON.stringify([req.userId]),
    media: [],
    subcribers: []

  },

    function (err, group) {
      if (err) return res.status(500).send("There was a problem creating the group`.");
      console.log(group);
      res.status(200).send(group);
    });

});


/**
 * @swagger
 *
 * /group/{id}:
 *   put:
 *     description: Edit Group Details 
 *     summary: Edit Group Details as An Admin of Such Group
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: JWMBC New Name
 *             description:
 *               type: string
 *               example: A better JWMBC Weekly Lecture Description
 *             
 *         required:
 *           - name
 *           - description
 * 
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       500:
 *         description: There was a problem changing password."
 *       400:
 *         description: email required
 *         
 */


//edit group info
router.put('/:id', VerifyToken, VerifyAdmin, function (req, res) {

  if (req.body.name === '' || req.body.description === '') {
    return res.status(400).send('Data Incomplete');
  }

  Group.findOne({ _id: req.params.id }, function (err, group) {
    // Group.findById(req.params.id, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the group.");

    if (!group) {
      res.status(404).send("No group found.");
      return;
    }

    if (!(JSON.parse([group.admin]).includes(req.userId))) {
      res.status(401).send("You have no authorization");
      return;
    }


    Group.findByIdAndUpdate(req.params.id, { name: req.body.name, description: req.body.description }, { new: true }, function (err, group) {
      if (err) return res.status(500).send("There was a problem updating the group.");
      res.status(200).send(group);
      return;
    });

  });



});


/**
 * @swagger
 *
 * /group/{id}/admin:
 *   put:
 *     description: Change Channel Administrators 
 *     summary: Edit Channel Administrators as An Admin of Such Channel. admin Should be set to empty string ("") to remove admin
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             admin1:
 *               type: string
 *               description: Should be empty ("") to remove admin
 *               example: 5e9cdd83e4d51f18624c7753
 *             admin2:
 *               type: string
 *               description: Should be empty ("") to remove admin
 *               example: ""
 *             
 *         required:
 *           - admin1
 *           - admin2
 * 
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       500:
 *         description: There was a problem changing password."
 *       400:
 *         description: email required
 *         
 */

//edit group info
router.put('/:id/admin', VerifyToken, VerifyAdmin, function (req, res) {


  Group.findOne({ _id: req.params.id }, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the group.");

    if (!group) {
      res.status(404).send("No group found.");
      return;
    }

    var new_admin = [group.admin];
    if (req.admin1 & VerifyUser(req.body.admin1)) {
      new_admin[1] = req.admin1;
    }
    else if (req.admin1 == "") { new_admin[1] = "" }

    if (req.admin2 & VerifyUser(req.body.admin2)) {
      new_admin[2] = req.admin2;
    }
    else if (req.admin2 == "") { new_admin[2] = "" }

    Group.findByIdAndUpdate(req.params.id, { admin: new_admin }, { new: true }, function (err, group) {
      if (err) return res.status(500).send("There was a problem updating the group.");
      res.status(200).send(group);
      return;
    });

  });



});



/**
 * @swagger
 *
 * /group/{id}:
 *   delete:
 *     description: Delete Channel 
 *     summary: Delete Channel as An Admin of Such Group
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 * 
 *     responses:
 *       200:
 *         description: Group Deleted Successfully
 *       500:
 *         description: Internal Error"
 *       400:
 *         description: Group not found
 *         
 */

//delete group
router.delete('/:id', VerifyToken, VerifyAdmin, function (req, res) {
  Group.findById(req.params.id, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the group.");
    if (!group) return res.status(404).send("No group found.");
    if (!(JSON.parse([group.admin]).includes(req.userId))) return res.status(401).send("You have no authorization");



    Group.findByIdAndRemove(req.params.id, function (err, group) {
      if (err) return res.status(500).send("There was a problem deleting the group.");
      res.status(200).send("group: " + group.name + " was deleted.");
    });
  });
});


/**
 * @swagger
 * /group/:
 *   get:
 *     tags:
 *       - Channel
 *     name: Get Channel list
 *     summary: Get Channel list
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     responses:
 *       '200':
 *         description: An array of Channel object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Group'
 *       '401':
 *         description: No auth token / no user found in db with that name
 *       '403':
 *         description: JWT token and username from client don't match
 */


// gives list of groups
router.get('/', cors(), function (req, res) {
  Group.find({}, { media: 0 }, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the groups.");
    res.status(200).send(group);
  });
});

/**
 * @swagger
 *
 * /group/{id}:
 *   get:
 *     description: Fetch  Channel Info 
 *     summary: Get Info of A Channel with its ID
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 * 
 *     responses:
 *       200:
 *         description: A Channel object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Group'
 *       500:
 *         description: Internal Error
 *       400:
 *         description: Group not found
 *         
 */
//get group info
router.get('/:id', cors(), function (req, res, next) {
  console.log(req.params.id)
  Group.findById(req.params.id, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the group.");
    if (!group) return res.status(404).send("No group found.");
    res.status(200).send(group);
  });

});



/**
 * @swagger
 *
 * /group/{id}/upload:
 *   post:
 *     description: Upload Media to Channel as Admin 
 *     summary: Upload Media to Channel as Admin 
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     produces:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 *       - in: formData
 *         name: file
 *         type: file
 *         description: The file/media to be uploaded
 *         required: true
 *       - in: formData
 *         name: title
 *         type: string
 *         description: Title of file/media to be uploaded
 *         required: true
 *       - in: formData
 *         name: lecturer
 *         type: string
 *         description: Lecturer in the file/media to be uploaded
 *         required: true
 * 
 *     responses:
 *       200:
 *         description: Upload Successful
 *         schema:
 *           type: object
 *           $ref: '#/definitions/Group'
 *       500:
 *         description: There was a problem changing password."
 *       400:
 *         description: email required
 *         
 */


//vanilla upload or not 
router.post("/:id/upload", cors(), /* VerifyToken, VerifyAdmin,*/ upload.single("file"), (req, res) => {
  // res.json({file : req.file})
  // res.redirect("/");
  // console.log(req);
  var file_info = {
    title: req.body.title,
    lecturer: req.body.lecturer,
    id: req.file.id,
    filename: req.file.filename,
    content_type: req.file.contentType,
    upload_date: req.file.uploadDate,
    size: req.file.size
  }
  // res.status(200).send(file_info);
  // console.log(file_info);

  // Group.findOne({ _id: req.params.id }, function (err, group) {
  //   // Group.findById(req.params.id, function (err, group) {
  //   if (err) return res.status(500).send("There was a problem finding the group.");

  //   if (!group) {
  //     res.status(404).send("No group found.");
  //     return;
  //   }

  //   group.media.push(file_info)

  Group.findByIdAndUpdate(req.params.id, { $push: { media: file_info } }, { new: true }, function (err, groups) {
    if (err) return res.status(500).send("There was a problem Finding and updating the group.");
    res.status(200).send(groups);
    return;
  });


  // });



});



/**
 * @swagger
 *
 * /group/media/{filename}:
 *   get:
 *     description: Stream a Media from Common Repo
 *     summary:  Stream a Media from Common Repo
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 * 
 *     parameters:
 *       - in: path
 *         name: filename
 *         schema:
 *           type: string
 *         required:
 *           - filename
 * 
 *     responses:
 *       200:
 *         description: A Streamed Media
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           
 *       500:
 *         description: Internal Error
 *       400:
 *         description: Media not found
 *         
 */


//Vanilla for getting and downloading from common repo 
router.get("/media/:filename", cors(),// VerifyToken, 
  (req, res) => {
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
router.get("/info/media", cors(), (req, res) => {
  const file = gfs.find().toArray((err, files) => {
    // check if files
    if (!files || files.length === 0) {
      return res.status(404).json({
        err: "no files exist"
      });
    }

    return res.json(files);
  });
});

//delete...
router.get("/:id/media/del/:filename/:media_id", cors(), VerifyToken, VerifyAdmin, (req, res) => {


  Group.findByIdAndUpdate(req.params.id, {$pull: {media: {filename: req.params.filename}}}, function (err, groups) {
    if (err) return res.status(500).send("There was a problem updating the group.");


    gfs.delete(new mongoose.Types.ObjectId(req.params.media_id), (err, data) => {
      if (err) return res.status(404).json({ err: err.message });
      // res.redirect("/");

      res.status(200).send("success");
    });

  });
});



/**
 * @swagger
 *
 * /group/{id}/sub:
 *   get:
 *     description: Subscribe to channel 
 *     summary: Subscribe to channel given its ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 * 
 *     responses:
 *       200:
 *         description: A Channel object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 *       500:
 *         description: Internal Error"
 *       400:
 *         description: Group not found
 *         
 */


router.get("/:id/sub", cors(), VerifyToken, (req, res) => {



  Group.findByIdAndUpdate(req.params.id, { $push: { subcribers: req.userId } }, { new: true }, function (err, groups) {
    if (err) return res.status(500).send("There was a problem Finding and updating the group.");

    User.findByIdAndUpdate(req.userId, { $push: { sub: groups._id } }, { new: true }, function (err, users) {
      if (err) return res.status(500).send("There was a problem updating the user.");
      res.status(200).send(users);
    });


  });



});

/**
 * @swagger
 *
 * /group/{id}/unsub:
 *   get:
 *     description: UnSubscribe to channel 
 *     summary: UnSubscribe to channel given its ID
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Channel
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required:
 *           - id
 * 
 *     responses:
 *       200:
 *         description: A Channel object
 *         schema:
 *           type: object
 *           $ref: '#/definitions/User'
 *       500:
 *         description: Internal Error"
 *       400:
 *         description: Group not found
 *         
 */

router.get("/:id/unsub", cors(), VerifyToken, (req, res) => {


  Group.findById(req.params.id, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the group.");
    if (!group) return res.status(404).send("No group found.");


    group.subcribers.splice(group.subcribers.indexOf(req.userId), 1);
    Group.findByIdAndUpdate(req.params.id, { subcribers: group.subcribers }, { new: true }, function (err, groups) {
      if (err) return res.status(500).send("There was a problem updating the group.");

      User.findById(req.userId, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");

        user.sub.splice(user.sub.indexOf(groups._id), 1);

        User.findByIdAndUpdate(req.userId, { sub: user.sub }, { new: true }, function (err, users) {
          if (err) return res.status(500).send("There was a problem updating the user.");
          res.status(200).send(users);
        });
      });

    });

  });


});
/////////////////////////////////

module.exports = router;