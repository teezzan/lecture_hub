var config = require('../config'); // get our config file
var User = require('../user/User');
var Group = require('../group/Group');

function verifyUser(id) {

    User.findOne({ _id: id }, function (err, user) {
        // Group.findById(req.params.id, function (err, group) {
            if (err) return false;
            if (!user) return false;
            return true;
    });
        
  };


module.exports = verifyUser;