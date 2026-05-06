const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
}, { _id: false });

const goalSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  category:    { type: String, enum: ['Career', 'Health', 'Learning', 'Relationships', 'Finance', 'Travel', 'Other'], default: 'Other' },
  description: { type: String, default: '' },
  targetDate:  { type: Date },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  milestones:  { type: [milestoneSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
