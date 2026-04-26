const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Helper to calculate fines (e.g., $1 per day late)
const calculateFine = (dueDate, returnDate) => {
  const due = new Date(dueDate);
  const returned = new Date(returnDate);
  const diffTime = returned - due;
  
  if (diffTime > 0) {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays * 1; // $1 per day
  }
  return 0;
};

// @desc    Issue a book
// @route   POST /api/transactions/issue
// @access  Private (Librarian/Admin)
exports.issueBook = async (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, error: 'No copies available' });
    }

    const transaction = await Transaction.create({
      user: userId,
      book: bookId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    book.availableCopies -= 1;
    await book.save();

    await Notification.create({
      user: userId,
      message: `Book "${book.title}" has been issued to you. Due date: ${new Date(transaction.dueDate).toLocaleDateString()}`,
      type: 'Approval'
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Return a book
// @route   PUT /api/transactions/return/:id
// @access  Private (Librarian/Admin)
exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('book');
    if (!transaction) return res.status(404).json({ success: false, error: 'Transaction not found' });
    
    if (transaction.status === 'Returned') {
      return res.status(400).json({ success: false, error: 'Book already returned' });
    }

    const returnDate = new Date();
    const fine = calculateFine(transaction.dueDate, returnDate);

    transaction.status = 'Returned';
    transaction.returnDate = returnDate;
    transaction.fineAmount = fine;
    await transaction.save();

    const book = await Book.findById(transaction.book._id);
    book.availableCopies += 1;
    await book.save();

    if (fine > 0) {
      await Notification.create({
        user: transaction.user,
        message: `Book "${book.title}" returned late. Fine applied: $${fine}`,
        type: 'Fine'
      });
    }

    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Request a book
// @route   POST /api/transactions/request
// @access  Private (Student/Faculty)
exports.requestBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, error: 'Book not found' });
    
    const transaction = await Transaction.create({
      user: req.user.id,
      book: bookId,
      status: 'Pending Approval',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Approve/Reject book request
// @route   PUT /api/transactions/request/:id
// @access  Private (Librarian/Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const transaction = await Transaction.findById(req.params.id).populate('book');
    if (!transaction) return res.status(404).json({ success: false, error: 'Request not found' });
    
    if (status === 'Issued') {
      const book = await Book.findById(transaction.book);
      if (book.availableCopies <= 0) {
        return res.status(400).json({ success: false, error: 'No copies available' });
      }
      book.availableCopies -= 1;
      await book.save();
      transaction.status = 'Issued';
      transaction.issueDate = Date.now();
      
      await Notification.create({
        user: transaction.user,
        message: `Your request for "${book.title}" has been approved!`,
        type: 'Approval'
      });
    } else {
      transaction.status = status;
      await Notification.create({
        user: transaction.user,
        message: `Your request for "${transaction.book?.title || 'a book'}" was ${status.toLowerCase()}.`,
        type: 'System'
      });
    }

    await transaction.save();
    res.status(200).json({ success: true, data: transaction });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user', 'username email role').populate('book', 'title isbn');
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get logged in user's transactions
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).populate('book', 'title author subject isbn');
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
