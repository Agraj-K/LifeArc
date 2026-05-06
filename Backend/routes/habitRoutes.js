const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');

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
    const habits = await Habit.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, category, color } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Habit title is required' });
    }

    const habit = await Habit.create({
      userId: req.user._id,
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
    } else {
      // Add the day and sort
      habit.completed = [...habit.completed, day].sort((a, b) => a - b);
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
