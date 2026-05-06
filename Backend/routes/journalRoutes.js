const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');

// @route   GET /api/journal
// @desc    Get all journal entries for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const entries = await Journal.find({ userId: req.user._id })
      .sort({ createdAt: -1 }); // Newest first
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    const entry = await Journal.create({
      userId: req.user._id,
      title: title || 'Untitled Entry',
      content: content || '',
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;

    const entry = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.title = title ?? entry.title;
    entry.content = content ?? entry.content;
    await entry.save(); // timestamps: true will auto-update updatedAt

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/journal/:id
// @desc    Delete a journal entry
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
