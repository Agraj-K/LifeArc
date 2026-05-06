const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// --- Env Verification ---
const requiredEnv = ['MONGODB_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ CRITICAL ERROR: ${env} is missing from environment!`);
  }
});

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Import Route Middleware ---
const { protect } = require('./middleware/authMiddleware');
const { adminOnly } = require('./middleware/adminMiddleware');

// --- Routes ---
console.log('🔗 Mounting Auth routes...');
app.use('/api/auth', require('./routes/authRoutes'));
console.log('🔗 Mounting Journal routes...');
app.use('/api/journal', require('./routes/journalRoutes'));
console.log('🔗 Mounting Goal routes...');
app.use('/api/goals', require('./routes/goalRoutes'));
console.log('🔗 Mounting Habit routes...');
app.use('/api/habits', require('./routes/habitRoutes'));
console.log('🔗 Mounting Event routes...');
app.use('/api/events', require('./routes/eventRoutes'));
console.log('🔗 Mounting Profile routes...');
app.use('/api/profile', require('./routes/profileRoutes'));
console.log('🔗 Mounting Admin routes...');
app.use('/api/admin', require('./routes/adminRoutes'));
console.log('✅ All routes mounted');

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  const fs = require('fs');
  const logMsg = `${new Date().toISOString()} - GLOBAL ERROR: ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync('backend_errors.log', logMsg);
  console.error('❌ Server Error:', err.message);
  res.status(500).json({ message: err.message });
});

// --- Health Check ---
app.get('/', (req, res) => {
  res.json({ message: 'Velora-Modular-API-v2 is running', status: 'ok' });
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
