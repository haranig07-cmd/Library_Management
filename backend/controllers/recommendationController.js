const Recommendation = require('../models/Recommendation');

// @desc    Create a recommendation
// @route   POST /api/recommendations
// @access  Private (Faculty)
exports.createRecommendation = async (req, res) => {
  try {
    const { title, author, subject, reason } = req.body;
    const recommendation = await Recommendation.create({
      faculty: req.user.id,
      title,
      author,
      subject,
      reason
    });
    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all recommendations
// @route   GET /api/recommendations
// @access  Private (Librarian/Admin)
exports.getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find().populate('faculty', 'username email');
    res.status(200).json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Update recommendation status
// @route   PUT /api/recommendations/:id
// @access  Private (Librarian/Admin)
exports.updateRecommendationStatus = async (req, res) => {
  try {
    const recommendation = await Recommendation.findByIdAndUpdate(req.params.id, { status: req.body.status }, {
      new: true,
      runValidators: true
    });
    if (!recommendation) {
      return res.status(404).json({ success: false, error: 'Recommendation not found' });
    }
    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
