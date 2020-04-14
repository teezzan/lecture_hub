var mongoose = require('mongoose');  
var GroupSchema = new mongoose.Schema({  
  name: { type: String, unique: true },
  description: String,
  admin: String,
  media: Array,
  subcribers : Array,
  blocked : { type: Boolean, default: false }
});
mongoose.model('Group', GroupSchema);

module.exports = mongoose.model('Group');