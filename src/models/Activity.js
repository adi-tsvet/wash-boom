const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const activitySchema = new Schema({
  occupiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true },
  washroom: { type: Schema.Types.ObjectId, ref: 'Washroom' },
  status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
});

// Avoid OverwriteModelError
module.exports = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
