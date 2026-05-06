const express = require('express');
const router = express.Router();
const Journal = require('../models/Journal');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// @route   GET /api/journal/public
// @desc    Get all public journal entries from all users
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const entries = await Journal.find({ isPublic: true })
      .populate('userId', 'name')
      .populate('comments.userId', 'name')
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
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 }); // Newest first
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/journal
// @desc    Create a new journal entry
// @access  Private
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content, isPublic, mood } = req.body;

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const entry = await Journal.create({
      userId: req.user._id,
      title: title || 'Untitled Entry',
      content: content || '',
      isPublic: isPublic === 'true' || isPublic === true,
      mood: mood || 'Neutral',
      images: imageUrls
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/journal/:id
// @desc    Update a journal entry
// @access  Private
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const { title, content, isPublic, mood } = req.body;

    const entry = await Journal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    entry.title = title ?? entry.title;
    entry.content = content ?? entry.content;
    if (isPublic !== undefined) entry.isPublic = isPublic === 'true' || isPublic === true;
    entry.mood = mood ?? entry.mood;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      entry.images = [...(entry.images || []), ...newImages];
    }

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

// @route   POST /api/journal/:id/like
// @desc    Toggle like on a journal entry
// @access  Private
router.post('/:id/like', async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    // Ensure users can only like public entries, or their own
    if (!entry.isPublic && entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const index = entry.likes.indexOf(req.user._id);
    if (index === -1) {
      entry.likes.push(req.user._id);
    } else {
      entry.likes.splice(index, 1);
    }

    await entry.save();
    
    // Return populated entry so frontend can easily update state
    const updatedEntry = await Journal.findById(req.params.id)
      .populate('userId', 'name')
      .populate('comments.userId', 'name');
    
    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/journal/:id/comment
// @desc    Add a comment to a journal entry
// @access  Private
router.post('/:id/comment', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const entry = await Journal.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    if (!entry.isPublic && entry.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    entry.comments.push({
      userId: req.user._id,
      text
    });

    await entry.save();

    const updatedEntry = await Journal.findById(req.params.id)
      .populate('userId', 'name')
      .populate('comments.userId', 'name');

    res.status(201).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/journal/:id/comment/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:id/comment/:commentId', async (req, res) => {
  try {
    const entry = await Journal.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    const comment = entry.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Ensure only the author of the comment can delete it
    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await entry.save();

    const updatedEntry = await Journal.findById(req.params.id)
      .populate('userId', 'name')
      .populate('comments.userId', 'name');

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
