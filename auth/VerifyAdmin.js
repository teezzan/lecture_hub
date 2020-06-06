var config = require('../config'); // get our config file
var User = require('../user/User');
var Group = require('../group/Group');

function verifyAdmin(req, res, next) {

    Group.findOne({ _id: req.params.id }, function (err, group) {
        // Group.findById(req.params.id, function (err, group) {
            if (err) return res.status(500).send("There was a problem finding the group.");
            
            if (!group) { 
                res.status(404).send("No group found.");
                return;}
                
            if (!(group.admin.includes(req.userId))) { 
                res.status(401).send("You have no authorization");
                // console.log(group.admin)
                // console.log(req.params.id)
                return;}
            next();
    });
        
  };


module.exports = verifyAdmin;