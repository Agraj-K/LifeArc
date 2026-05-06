const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Goal = require('../models/Goal');
const Journal = require('../models/Journal');
const Habit = require('../models/Habit');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics
// @access  Private/Admin
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, suspendedUsers, totalEvents, totalGoals, totalJournals, totalHabits] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'Active' }),
        User.countDocuments({ status: 'Suspended' }),
        Event.countDocuments(),
        Goal.countDocuments(),
        Journal.countDocuments(),
        Habit.countDocuments(),
      ]);

    res.json({ totalUsers, activeUsers, suspendedUsers, totalEvents, totalGoals, totalJournals, totalHabits });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with their item counts
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    // For each user, get their events and goals count
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const [events, goals] = await Promise.all([
          Event.countDocuments({ userId: user._id }),
          Goal.countDocuments({ userId: user._id }),
        ]);
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          suspensionCount: user.suspensionCount || 0,
          createdAt: user.createdAt,
          events,
          goals,
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/admin/users/:id/suspend
// @desc    Toggle user Active/Suspended status
// @access  Private/Admin
router.patch('/users/:id/suspend', async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from suspending themselves or other admins
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot suspend your own account' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'You cannot suspend another administrator' });
    }

    user.status = user.status === 'Active' ? 'Suspended' : 'Active';
    if (user.status === 'Suspended') {
      user.suspensionReason = reason || '';
      user.suspensionCount = (user.suspensionCount || 0) + 1;
    } else {
      user.suspensionReason = '';
    }
    
    await user.save();

    res.json({ _id: user._id, name: user.name, status: user.status, suspensionCount: user.suspensionCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user and all their data
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves or other admins
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'You cannot delete another administrator' });
    }

    const userId = user._id;

    // Delete all user's data across all collections
    await Promise.all([
      Journal.deleteMany({ userId }),
      Goal.deleteMany({ userId }),
      Habit.deleteMany({ userId }),
      Event.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    res.json({ message: `User ${user.name} and all their data deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/feedback
// @desc    Get all feedback
// @access  Private/Admin
router.get('/feedback', async (req, res) => {
  try {
    const Feedback = require('../models/Feedback');
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/feedback/:id
// @desc    Delete a feedback or appeal
// @access  Private/Admin
router.delete('/feedback/:id', async (req, res) => {
  try {
    const Feedback = require('../models/Feedback');
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/admin/journals
// @desc    Get all public journals
// @access  Private/Admin
router.get('/journals', async (req, res) => {
  try {
    const journals = await Journal.find({ isPublic: true })
      .populate('userId', 'name email')
      .populate('comments.userId', 'name')
      .sort({ createdAt: -1 });
    res.json(journals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/admin/journals/:id
// @desc    Delete any journal (community moderation)
// @access  Private/Admin
router.delete('/journals/:id', async (req, res) => {
  try {
    const journal = await Journal.findByIdAndDelete(req.params.id);
    if (!journal) {
      return res.status(404).json({ message: 'Journal not found' });
    }
    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
