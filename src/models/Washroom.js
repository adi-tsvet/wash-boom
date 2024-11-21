const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const washroomSchema = new Schema({
  name: { type: String, unique: true, required: true },
  status: { type: String, enum: ['occupied', 'vacant'], default: 'vacant' },
  activities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }] // Referencing activities
});

// Avoid OverwriteModelError
module.exports = mongoose.models.Washroom || mongoose.model('Washroom', washroomSchema);