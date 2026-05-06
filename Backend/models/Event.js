const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:       { type: String, required: true, trim: true },
  category:    { type: String, enum: ['Career', 'Health', 'Learning', 'Relationships', 'Finance', 'Travel', 'Other'], default: 'Other' },
  description: { type: String, default: '' },
  startDate:   { type: Date },
  targetDate:  { type: Date },
  progress:    { type: Number, min: 0, max: 100, default: 0 },
  location:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
