const Book = require('../models/Book');

// @desc    Get all books (with search/filter)
// @route   GET /api/books
// @access  Public/Private
exports.getBooks = async (req, res) => {
  try {
    const queryObj = { ...req.query };
    
    // Advanced filtering (e.g. searching by title or author via regex)
    if (queryObj.search) {
      const searchRegex = new RegExp(queryObj.search, 'i');
      queryObj.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { subject: searchRegex },
        { isbn: searchRegex }
      ];
      delete queryObj.search;
    }

    const books = await Book.find(queryObj);
    res.status(200).json({ success: true, count: books.length, data: books });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public/Private
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Create new book
// @route   POST /api/books
// @access  Private (Librarian/Admin)
exports.createBook = async (req, res) => {
  try {
    // Ensure availableCopies defaults to totalCopies if not provided
    if (req.body.totalCopies && req.body.availableCopies === undefined) {
      req.body.availableCopies = req.body.totalCopies;
    }
    
    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private (Librarian/Admin)
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Delete book
// @route   DELETE /api/books/:id
// @access  Private (Librarian/Admin)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, error: 'Book not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
