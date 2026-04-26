const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const Recommendation = require('../models/Recommendation');

// @desc    Export entire database as JSON
// @route   GET /api/system/backup
// @access  Private (Admin)
exports.exportDatabase = async (req, res) => {
  try {
    const [users, books, transactions, recommendations] = await Promise.all([
      User.find({}),
      Book.find({}),
      Transaction.find({}),
      Recommendation.find({})
    ]);

    const backup = {
      timestamp: new Date(),
      users,
      books,
      transactions,
      recommendations
    };

    res.status(200).json({ success: true, data: backup });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Backup failed' });
  }
};

// @desc    Restore database from JSON
// @route   POST /api/system/restore
// @access  Private (Admin)
exports.restoreDatabase = async (req, res) => {
  try {
    const { users, books, transactions, recommendations } = req.body;
    
    if (users) {
      await User.deleteMany({});
      await User.insertMany(users);
    }
    if (books) {
      await Book.deleteMany({});
      await Book.insertMany(books);
    }
    if (transactions) {
      await Transaction.deleteMany({});
      await Transaction.insertMany(transactions);
    }
    if (recommendations) {
      await Recommendation.deleteMany({});
      await Recommendation.insertMany(recommendations);
    }

    res.status(200).json({ success: true, message: 'Database restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Restore failed: ' + error.message });
  }
};
