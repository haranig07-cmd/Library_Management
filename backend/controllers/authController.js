const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id, role, username) => {
  return jwt.sign({ id, role, username }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30m',
  });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate request
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Please provide an email, password, and role' });
    }

    // Check for user (we allow logging in with username or email)
    const user = await User.findOne({ 
      $or: [{ email: email }, { username: email }] 
    }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials or account not found' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // STRCT ROLE CHECK (Enterprise Security Requirement)
    if (user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        error: `Role mismatch. You are not authorized to login as ${role}` 
      });
    }

    // Create token
    const token = generateToken(user._id, user.role, user.username);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
