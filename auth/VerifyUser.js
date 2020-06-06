var config = require('../config'); // get our config file
var User = require('../user/User');
var Group = require('../group/Group');

function verifyUser(id) {
    console.log(id)
    User.findOne({ _id: id }, function (err, user) {
        // Group.findById(req.params.id, function (err, group) {
            if (err) return false;
            if (!user) return false;
            // console.log(user)
            return true;
    });
        
  };


module.exports = verifyUser;