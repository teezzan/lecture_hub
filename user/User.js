var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, unique: true },
  password: String,
  sub: Array,
  verified : { type: Boolean, default: false },
  blocked : { type: Boolean, default: false }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');