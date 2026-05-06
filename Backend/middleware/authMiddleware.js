const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        console.log('❌ User not found for token');
        return res.status(401).json({ message: 'User not found' });
      }

      if (req.user.status === 'Suspended') {
        return res.status(403).json({ message: 'Your account has been suspended' });
      }

      next();
    } catch (err) {
      console.error('❌ Token verification failed:', err.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(500).json({ message: 'Internal Server Error in Auth Middleware' });
  }
};

module.exports = { protect };
