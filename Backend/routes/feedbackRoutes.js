const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback
// @desc    Submit new feedback
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, message, type } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    const feedback = await Feedback.create({
      name,
      email,
      message,
      type: type || 'Feedback'
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
