const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: String,
  subject: String,
  reason: String,
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Acquired'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
