var mongoose = require('mongoose');
const MongoPaging = require('mongo-cursor-pagination');
var GroupSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  description: String,
  admin: Array,
  media: Array,
  subcribers: Array,
  blocked: { type: Boolean, default: false }
});

GroupSchema.plugin(MongoPaging.mongoosePlugin);
mongoose.model('Group', GroupSchema);
module.exports = mongoose.model('Group');