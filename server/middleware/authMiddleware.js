const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'darshanease_secret_key_2026_super_secure');
      
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error('JWT verification error:', error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

const organizerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ORGANIZER') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an organizer' });
  }
};

const organizerOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'ORGANIZER' || req.user.role === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized, role insufficient' });
  }
};

module.exports = { protect, adminOnly, organizerOnly, organizerOrAdmin };
