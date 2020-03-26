var mongoose = require('mongoose');  
var GroupSchema = new mongoose.Schema({  
  name: String,
  description: String,
  admin: String,
  media: Array
});
mongoose.model('Group', GroupSchema);

module.exports = mongoose.model('Group');