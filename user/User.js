var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, unique: true },
  password: String,
  sub: Array,
  verified : { type: Boolean, default: true },
  blocked : { type: Boolean, default: false },
  resetPasswordToken : String,
  resetPasswordExpires : { type: Date, default: Date.now() }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');