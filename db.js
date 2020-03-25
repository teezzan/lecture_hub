var mongoose = require('mongoose');
const crypto = require("crypto");
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");

// mongoose.connect('mongodb+srv://adminlove:t%40ye1234@skrypt-sbitd.mongodb.net/test?retryWrites=true&w=majority', {
mongoose.connect('mongodb://localhost:27017/mydbtest', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (error) => {
    if (error) {
        console.log(error);
    } else {
        console.log('created successfully');
    }
});

