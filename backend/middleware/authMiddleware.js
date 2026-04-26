const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify token
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ success: false, error: 'Not authorized - No Token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Safety check for ID
    if (!decoded.id || decoded.id === 'undefined') {
      return res.status(401).json({ success: false, error: 'Malformed Session Token' });
    }

    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User session expired' });
    }

    next();
  } catch (err) {
    console.error('Auth Error:', err.message);
    return res.status(401).json({ success: false, error: 'Session Invalid' });
  }
};

// Grant access to specific roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Unauthorized access`
      });
    }
    next();
  };
};
