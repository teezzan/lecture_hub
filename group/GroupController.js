var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var cors = require('cors');


var VerifyToken = require('../auth/VerifyToken');
var VerifyAdmin = require('../auth/VerifyAdmin');
var VerifyUser = require('../auth/VerifyUser');
let mediarects = require('./mediarects.json');


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
function randomint(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}


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
    admin: [req.userId],
    media: [],
    subcribers: []

  },

    function (err, group) {
      if (err) return res.status(500).send("There was a problem creating the group`.");
      console.log(group);
      User.findByIdAndUpdate(req.userId, { $push: { adminGroups: group._id } }, (err, user) => {
        if (err) return res.status(500).send("There was a problem updating the User.");
        res.status(200).send(group);
      });

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
async function veruse(id) {
  var result = await VerifyUser(id);
  return result
}

//edit group info
router.put('/:id', VerifyToken, VerifyAdmin, function (req, res) {

  if (req.body.name === '' || req.body.description === '') {
    return res.status(400).send('Data Incomplete');
  }
  var push = {}
  var pull = {};
  // console.log(typeof(req.body.admin))
  if (req.body.pushAdmin != undefined) {

    var pushAdmin = [];
    for (var i = 0; i < req.body.pushAdmin.length; i++) {

      if (veruse(req.body.pushAdmin[i])) {
        pushAdmin.push(req.body.pushAdmin[i]);
      }
    }
    push = { $push: { admin: { $each: pushAdmin } } }
    // console.log(pushAdmin);
  }
  else if (req.body.pullAdmin != undefined) {
    pull = { $pull: { admin: { $in: req.body.pullAdmin } } }
  }
  Group.findByIdAndUpdate(req.params.id,
    { $set: { name: req.body.name, description: req.body.description }, ...push, ...pull }, { new: true }, function (err, group) {
      if (err) return res.status(500).send(err);
      res.status(200).send(group);
      return;
    });
});

// router.put('/:id', VerifyToken, VerifyAdmin, function (req, res) {

//   if (req.body.name === '' || req.body.description === '') {
//     return res.status(400).send('Data Incomplete');
//   }
//   Group.findByIdAndUpdate({ _id: req.params.id }).set({name: req.body.name, description: req.body.description}).push({ admin: req.body.admin })
//     .then(group => { res.status(200).send(group); })
//     .catch(err => { res.status(500).send(err); })
//   });


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
// router.put('/:id/admin', VerifyToken, VerifyAdmin, function (req, res) {


//   Group.findOne({ _id: req.params.id }, function (err, group) {
//     if (err) return res.status(500).send("There was a problem finding the group.");

//     if (!group) {
//       res.status(404).send("No group found.");
//       return;
//     }

//     var new_admin = [group.admin];
//     if (req.admin1 & VerifyUser(req.body.admin1)) {
//       new_admin[1] = req.admin1;
//     }
//     else if (req.admin1 == "") { new_admin[1] = "" }

//     if (req.admin2 & VerifyUser(req.body.admin2)) {
//       new_admin[2] = req.admin2;
//     }
//     else if (req.admin2 == "") { new_admin[2] = "" }

//     Group.findByIdAndUpdate(req.params.id, { admin: new_admin }, { new: true }, function (err, group) {
//       if (err) return res.status(500).send("There was a problem updating the group.");
//       res.status(200).send(group);
//       return;
//     });

//   });



// });



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

  Group.findByIdAndRemove(req.params.id, function (err, group) {
    if (err) return res.status(500).send("There was a problem deleting the group.");
    User.findByIdAndUpdate(req.userId, { $pull: { adminGroups: group._id } }, (err, user) => {
      if (err) return res.status(500).send("There was a problem updating user.");
      res.status(200).send("group was deleted.");
    })

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


//needs pagination
router.get('/', cors(), function (req, res) {
  Group.find({}, { media: 0, subcribers: 0 }, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the groups.");
    res.status(200).send(group);
  });
});


//get info of certain groups
// gives list of groups
router.post('/', cors(), function (req, res) {
  // var output =[];
  var query = req.body.query;
  Group.find({ _id: { $in: query } }, { media: 0 }, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the groups.");
    res.status(200).send(group);
  });
});

router.get('/search/:key', cors(), function (req, res) {
  Group.find({ name: { $regex: req.params.key } }, { media: 0, subcribers: 0 }, function (err, group) {
    if (err) return res.status(500).send("There was a problem finding the groups.");
    res.status(200).send(group);
  });
});
//http://localhost:3000/api/group/myobjects?limit=5&next=eyIkb2lkIjoiNWVjNTljYTYwN2RmMDAxYjZiOWE0MjEyIn0
router.get('/myobjects', async (req, res, next) => {
  try {
    Group.paginate({
      limit: req.query.limit === null ? 5 : parseInt(req.query.limit), // Upper limit,
      next: req.query.next === null ? "" : req.query.next,
      prev: req.query.prev === null ? "" : req.query.prev,
    }).then((result) => {
      for (let i = 0; i < result.results.length; i++) {
        result.results[i].media = [];
        result.results[i].subcribers = [];
      }
      res.json(result);
    })
  } catch (err) {
    // next(err);
    console.log("errrorrrr")
    res.status(501).send(err.message);
  }
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
router.post("/:id/upload", cors(), VerifyToken, VerifyAdmin, upload.single("file"), (req, res) => {

  var file_info = {
    title: req.body.title,
    lecturer: req.body.lecturer,
    id: req.file.id,
    filename: req.file.filename,
    content_type: req.file.contentType,
    upload_date: req.file.uploadDate,
    size: req.file.size
  }

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
        // console.log("1=> lala");
        // gfs.openDownloadStreamByName(req.params.filename).pipe(res);
        //redirect
        res.redirect(`http://${mediarects.media[randomint(0, mediarects.media.length - 1)].link}`);

      });
  });

router.get("/mediaa/:filename", cors(),// VerifyToken, 
  (req, res) => {
    console.log("entered first")

    gfs.find({
      filename: req.params.filename
    }).toArray((err, file) => {
      console.log("file => ", file)
      if (err) {
        console.log("err")
        return res.status(400).send({
          err: errorHandler.getErrorMessage(err)
        });
      }
      if (!file || file.length === 0) {
        console.log("'No file found'")

        return res.status(404).send({
          err: 'No file found'
        });
      }
      if (req.headers['range']) {
        console.log("entered chunk");

        // console.log(req.headers['range']);
        file = file[0];

        var parts = req.headers['range'].replace(/bytes=/, "").split("-");
        var partialstart = parts[0];
        var partialend = parts[1];

        var start = parseInt(partialstart, 10);
        var end = partialend ? parseInt(partialend, 10) : file.length - 1;
        var chunksize = (end - start) + 1;
        //	console.log("bything");
        res.writeHead(206, {
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Range': 'bytes ' + start + '-' + end + '/' + file.length,
          'Content-Type': file.contentType,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': 0
        });


        let downloadStream = gfs.openDownloadStreamByName(req.params.filename,
          { start: start }).end(end);


        console.log("start streaming");
        downloadStream.pipe(res);
        // downloadStream.on('data', function (data) {
        //   res.write(data);
        //   console.log("data here oo")
        // });
      } else {
        console.log("entered last");
        res.header('Content-Length', file[0].length);
        res.header('Content-Type', file[0].contentType);

        gfs.openDownloadStreamByName(req.params.filename).pipe(res);

      }
    });

  });
console.log("got out");



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


  Group.findByIdAndUpdate(req.params.id, { $pull: { media: { filename: req.params.filename } } }, { new: true }, function (err, groups) {
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


