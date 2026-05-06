const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Import Route Middleware ---
const { protect } = require('./middleware/authMiddleware');
const { adminOnly } = require('./middleware/adminMiddleware');

// --- Routes ---
app.use('/api/auth',    require('./routes/authRoutes'));
app.use('/api/journal', protect, require('./routes/journalRoutes'));
app.use('/api/goals',   protect, require('./routes/goalRoutes'));
app.use('/api/habits',  protect, require('./routes/habitRoutes'));
app.use('/api/events',  protect, require('./routes/eventRoutes'));
app.use('/api/profile', protect, require('./routes/profileRoutes'));
app.use('/api/admin',   protect, adminOnly, require('./routes/adminRoutes'));

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ message: 'LifeArc API is running', status: 'ok' });
});

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// --- Connect to MongoDB & Start Server ---
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
