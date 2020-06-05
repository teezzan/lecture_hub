var mongoose = require('mongoose');
function randomint(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
var UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true, default: `HM${randomint(1, 1000)}${randomint(1, 1000)}` },
  password: String,
  sub: Array,
  submediacount: Array,
  adminGroups: Array,
  verified: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: { type: Date, default: Date.now() }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');