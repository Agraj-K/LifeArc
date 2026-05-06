const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// @route   GET /api/events
// @desc    Get all events for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, category, description, startDate, targetDate, progress, location } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Event title is required' });
    }

    const event = await Event.create({
      userId: req.user._id,
      title,
      category: category || 'Other',
      description: description || '',
      startDate: startDate || null,
      targetDate: targetDate || null,
      progress: progress || 0,
      location: location || '',
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.id, userId: req.user._id });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const { title, category, description, startDate, targetDate, progress, location } = req.body;

    event.title       = title       ?? event.title;
    event.category    = category    ?? event.category;
    event.description = description ?? event.description;
    event.startDate   = startDate   ?? event.startDate;
    event.targetDate  = targetDate  ?? event.targetDate;
    event.progress    = progress    ?? event.progress;
    event.location    = location    ?? event.location;

    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete an event
// @access  Private
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
