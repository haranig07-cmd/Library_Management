const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a book title'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please specify a subject/category']
  },
  isbn: {
    type: String,
    required: [true, 'Please add an ISBN'],
    unique: true
  },
  shelfLocation: String,
  category: String,
  coverImage: String,
  status: {
    type: String,
    enum: ['Good', 'Damaged', 'Lost'],
    default: 'Good'
  },
  edition: {
    type: String
  },
  totalCopies: {
    type: Number,
    required: true,
    min: 1
  },
  availableCopies: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Book', bookSchema);
