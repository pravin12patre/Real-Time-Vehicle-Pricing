// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Optional: if you need to query user details

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB to get all details including role
      req.user = await User.findById(decoded.user.id).select('-password'); // Exclude password

      if (!req.user) {
         return res.status(401).json({ msg: 'Not authorized, user not found for token' });
      }

      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      // Differentiate JWT errors (like expired, malformed) from user not found
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        res.status(401).json({ msg: 'Not authorized, token failed or expired' });
      } else {
        res.status(401).json({ msg: 'Not authorized, general token error' });
      }
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  // Assumes 'protect' middleware has run and req.user is populated with role
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ msg: 'Forbidden: Admin access required.' });
  }
};

module.exports = { protect, admin };
