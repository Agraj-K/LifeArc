const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/journal/public
// @desc    Get all public journal entries from all users
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const entries = await Journal.find({ isPublic: true })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// All routes below this line require authentication
router.use(protect);

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
    const { title, content, isPublic, mood } = req.body;

    const entry = await Journal.create({
      userId: req.user._id,
      title: title || 'Untitled Entry',
      content: content || '',
      isPublic: isPublic || false,
      mood: mood || 'Neutral'
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
    const { title, content, isPublic, mood } = req.body;

    const entry = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.title = title ?? entry.title;
    entry.content = content ?? entry.content;
    entry.isPublic = isPublic ?? entry.isPublic;
    entry.mood = mood ?? entry.mood;

    await entry.save(); 
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
