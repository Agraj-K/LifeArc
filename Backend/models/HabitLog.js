const mongoose = require('mongoose');

const habitLogSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date:    { type: Date, required: true }, // Store normalized date (start of day)
  status:  { type: String, enum: ['attended', 'missed', 'off'], default: 'attended' },
  photo:   { type: String }, // Cloudinary URL for the "Progress Snap"
  note:    { type: String },
}, { timestamps: true });

// Ensure one log per habit per day
habitLogSchema.index({ habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('HabitLog', habitLogSchema);
