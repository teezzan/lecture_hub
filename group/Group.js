var mongoose = require('mongoose');  
var GroupSchema = new mongoose.Schema({  
  name: String,
  description: String,
  admin: String // use id to store admin. use token to derive id bcrypt
});
mongoose.model('Group', GroupSchema);

module.exports = mongoose.model('Group');