// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Optional: if you need to query user details

const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header (Bearer token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request object (could fetch full user object if needed)
      // For now, just attaching the user ID from the token is often sufficient
      req.user = decoded.user; // Assuming payload is { user: { id: '...' } }

      // Optional: If you need the full user object for subsequent operations
      // req.user = await User.findById(decoded.user.id).select('-password');
      // if (!req.user) {
      //   return res.status(401).json({ msg: 'Not authorized, user not found' });
      // }

      next(); // Proceed to the protected route
    } catch (error) {
      console.error('Token verification error:', error.message);
      res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

// Optional: Middleware for admin access (if roles are implemented)
// const admin = (req, res, next) => {
//   if (req.user && req.user.role === 'admin') {
//     next();
//   } else {
//     res.status(403).json({ msg: 'Not authorized as an admin' });
//   }
// };

module.exports = { protect /*, admin */ };
