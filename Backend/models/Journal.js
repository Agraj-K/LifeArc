const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:   { type: String, default: 'Untitled Entry', trim: true },
  content: { type: String, default: '' },
  isPublic: { type: Boolean, default: false },
  mood:    { type: String, default: 'Neutral' },
}, { timestamps: true }); // createdAt and updatedAt auto-managed

module.exports = mongoose.model('Journal', journalSchema);
