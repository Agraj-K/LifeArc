const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goalId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Goal' }, // Linked Goal
  title:     { type: String, required: true, trim: true },
  category:  { type: String, enum: ['Health', 'Learning', 'Mindfulness', 'Career', 'Finance', 'Other'], default: 'Health' },
  color:     { type: String, default: 'teal' },
  completed: { type: [Number], default: [] }, // Array of day-of-month numbers (1-31)
  streak:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Habit', habitSchema);
