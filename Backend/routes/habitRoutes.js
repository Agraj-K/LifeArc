const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const HabitLog = require('../models/HabitLog');
const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.use(protect);

// Helper: calculate streak from completed days array
const calcStreak = (completed) => {
  const today = new Date().getDate();
  let streak = 0;
  for (let i = today; i >= 1; i--) {
    if (completed.includes(i)) streak++;
    else break;
  }
  return streak;
};

// @route   GET /api/habits
// @desc    Get all habits for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user._id })
      .populate('goalId', 'title')
      .sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/habits/:id/logs
// @desc    Get all logs for a habit (for heatmap)
// @access  Private
router.get('/:id/logs', async (req, res) => {
  try {
    const logs = await HabitLog.find({ habitId: req.params.id, userId: req.user._id })
      .sort({ date: 1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/habits/goal/:goalId/logs
// @desc    Get all logs for a specific Goal's linked habit
// @access  Private
router.get('/goal/:goalId/logs', async (req, res) => {
  try {
    const habit = await Habit.findOne({ goalId: req.params.goalId, userId: req.user._id });
    if (!habit) return res.json([]);
    const logs = await HabitLog.find({ habitId: habit._id, userId: req.user._id })
      .sort({ date: 1 });
    res.json({ habitId: habit._id, logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, category, color, goalId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      userId: req.user._id,
      goalId: goalId || null,
      title,
      category: category || 'Health',
      color: color || 'teal',
      completed: [],
      streak: 0,
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/habits/:id/log
// @desc    Log a daily check-in with an optional photo
// @access  Private
router.post('/:id/log', upload.single('photo'), async (req, res) => {
  try {
    const { date, note, status } = req.body;
    let normalizedDate;
    if (date) {
      normalizedDate = new Date(date); // Use the exact timestamp sent by frontend
    } else {
      normalizedDate = new Date();
      normalizedDate.setHours(0, 0, 0, 0);
    }

    const log = await HabitLog.findOneAndUpdate(
      { habitId: req.params.id, date: normalizedDate, userId: req.user._id },
      { 
        status: status || 'attended',
        photo: req.file ? req.file.path : undefined,
        note: note || ''
      },
      { upsert: true, new: true }
    );

    // Also update the Habit's 'completed' array for backward compatibility with the month view
    const dayOfMonth = normalizedDate.getDate();
    const habit = await Habit.findById(req.params.id);
    if (habit && !habit.completed.includes(dayOfMonth)) {
      habit.completed.push(dayOfMonth);
      habit.completed.sort((a, b) => a - b);
      habit.streak = calcStreak(habit.completed);
      await habit.save();
    }

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/habits/:id/toggle
// @desc    Toggle a specific day number as completed or not
// @access  Private
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { day } = req.body; // day is a number 1-31

    if (!day || day < 1 || day > 31) {
      return res.status(400).json({ message: 'Invalid day number (must be 1-31)' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const isCompleted = habit.completed.includes(day);

    if (isCompleted) {
      // Remove the day
      habit.completed = habit.completed.filter(d => d !== day);
      // Also delete the log for that day if it exists (simplified: uses current month/year)
      const targetDate = new Date();
      targetDate.setDate(day);
      targetDate.setHours(0,0,0,0);
      await HabitLog.findOneAndDelete({ habitId: habit._id, date: targetDate });
    } else {
      // Add the day and sort
      habit.completed = [...habit.completed, day].sort((a, b) => a - b);
      // Create a basic log
      const targetDate = new Date();
      targetDate.setDate(day);
      targetDate.setHours(0,0,0,0);
      await HabitLog.create({ habitId: habit._id, userId: req.user._id, date: targetDate });
    }

    // Recalculate streak
    habit.streak = calcStreak(habit.completed);

    await habit.save();
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
