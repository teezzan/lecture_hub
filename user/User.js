/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       id:
 *         type: integer
 *       first_name:
 *         type: string
 *       last_name:
 *         type: integer
 *       email:
 *         type: string
 *       username:
 *         type: string
 *       password:
 *         type: string
 *         format: password
 *       resetPasswordToken:
 *         type: string
 *       resetPasswordExpires:
 *         type: string
 *         format: date-time
 *       required:
 *         - email
 *         - username
 *         - password
 */


var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: { type: String, unique: true },
  password: String,
  sub: Array,
  verified : { type: Boolean, default: false },
  blocked : { type: Boolean, default: false },
  resetPasswordToken : String,
  resetPasswordExpires : { type: Date, default: Date.now }
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');