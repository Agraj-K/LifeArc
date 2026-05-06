const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Journal = require('../models/Journal');
const Goal = require('../models/Goal');
const Habit = require('../models/Habit');
const Event = require('../models/Event');

// @route   GET /api/profile
// @desc    Get logged-in user's profile + activity counts
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    // Run all count queries in parallel for performance
    const [journalCount, goalsCount, habitsCount, eventsCount, habits] = await Promise.all([
      Journal.countDocuments({ userId }),
      Goal.countDocuments({ userId }),
      Habit.countDocuments({ userId }),
      Event.countDocuments({ userId }),
      Habit.find({ userId }).select('streak'),
    ]);

    // Calculate best streak across all habits
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;

    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      bio: req.user.bio,
      location: req.user.location,
      website: req.user.website,
      role: req.user.role,
      createdAt: req.user.createdAt,
      stats: {
        events: eventsCount,
        goals: goalsCount,
        habits: habitsCount,
        journalEntries: journalCount,
        streak: bestStreak,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/profile
// @desc    Update profile fields (name, bio, location, website)
// @access  Private
router.put('/', async (req, res) => {
  try {
    const { name, bio, location, website } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name     = name     ?? user.name;
    user.bio      = bio      ?? user.bio;
    user.location = location ?? user.location;
    user.website  = website  ?? user.website;

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      location: user.location,
      website: user.website,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
