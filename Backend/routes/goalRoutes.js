const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

// @route   GET /api/goals
// @desc    Get all goals for logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, category, description, targetDate, progress, milestones } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Goal title is required' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      category: category || 'Other',
      description: description || '',
      targetDate: targetDate || null,
      progress: progress || 0,
      milestones: milestones || [],
    });

    // Automatically create a linked Habit for daily tracking
    const Habit = require('../models/Habit');
    await Habit.create({
      userId: req.user._id,
      goalId: goal._id,
      title: goal.title,
      category: goal.category === 'Career' ? 'Career' : 
                goal.category === 'Health' ? 'Health' : 
                goal.category === 'Learning' ? 'Learning' : 
                goal.category === 'Finance' ? 'Finance' : 'Other',
      color: 'teal',
      completed: [],
      streak: 0,
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal (title, description, category, targetDate, progress, milestones)
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const { title, category, description, targetDate, progress, milestones } = req.body;

    goal.title       = title       ?? goal.title;
    goal.category    = category    ?? goal.category;
    goal.description = description ?? goal.description;
    goal.targetDate  = targetDate  ?? goal.targetDate;
    goal.progress    = progress    ?? goal.progress;
    goal.milestones  = milestones  ?? goal.milestones;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PATCH /api/goals/:id/milestone
// @desc    Toggle a specific milestone's done status and recalculate progress
// @access  Private
router.patch('/:id/milestone', async (req, res) => {
  try {
    const { index } = req.body;

    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (index === undefined || index < 0 || index >= goal.milestones.length) {
      return res.status(400).json({ message: 'Invalid milestone index' });
    }

    // Toggle the milestone
    goal.milestones[index].done = !goal.milestones[index].done;

    // Recalculate progress based on completed milestones
    const total = goal.milestones.length;
    const done = goal.milestones.filter(m => m.done).length;
    goal.progress = total > 0 ? Math.round((done / total) * 100) : 0;

    // Mark nested array as modified so Mongoose saves it
    goal.markModified('milestones');
    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
