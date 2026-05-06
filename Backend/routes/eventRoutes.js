const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

// Apply protection to all routes below
router.use(protect);

// @route   GET /api/events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/events
router.post('/', upload.array('images', 10), async (req, res) => {
  try {
    const { title, category, description, startDate, targetDate, progress, location } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Event title is required' });
    }

    const imageUrls = req.files ? req.files.map(file => file.path) : [];

    const event = await Event.create({
      userId: req.user._id,
      title,
      category: category || 'Other',
      description: description || '',
      startDate: (startDate && startDate !== "") ? startDate : null,
      targetDate: (targetDate && targetDate !== "") ? targetDate : null,
      progress: progress || 0,
      location: location || '',
      images: imageUrls
    });

    res.status(201).json(event);
  } catch (error) {
    const fs = require('fs');
    fs.appendFileSync('backend_errors.log', `${new Date().toISOString()} - ERROR: ${error.message}\n${error.stack}\n\n`);
    console.error('Error creating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/events/:id
// Note: Adding upload.array here because frontend sends FormData for updates too
router.put('/:id', upload.array('images', 10), async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, category, description, startDate, targetDate, progress, location } = req.body;

    event.title       = title       ?? event.title;
    event.category    = category    ?? event.category;
    event.description = description ?? event.description;
    event.startDate   = (startDate && startDate !== "") ? startDate : event.startDate;
    event.targetDate  = (targetDate && targetDate !== "") ? targetDate : event.targetDate;
    event.progress    = progress    ?? event.progress;
    event.location    = location    ?? event.location;

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      event.images = [...event.images, ...newImages];
    }

    await event.save();
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
