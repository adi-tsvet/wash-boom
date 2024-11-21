// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  adminFlag: { type: Boolean, default: false },
  dateJoined: { type: Date, default: Date.now },
  assignedWashrooms: [{ type: Schema.Types.ObjectId, ref: 'Washroom' }],
});

// Avoid OverwriteModelError
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
