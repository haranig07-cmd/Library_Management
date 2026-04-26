const User = require('../models/User');
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');

// @desc    Get system statistics
exports.getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const issuedToday = await Transaction.countDocuments({ 
      issueDate: { $gte: today },
      status: 'Issued'
    });

    const pendingReturns = await Transaction.countDocuments({ 
      status: 'Issued',
      dueDate: { $lt: new Date() }
    });

    const fineStats = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$fineAmount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalBooks,
        totalTransactions,
        issuedToday,
        pendingReturns,
        totalFines: fineStats[0]?.total || 0,
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage().heapUsed
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Get system logs (Mock)
exports.getSystemLogs = async (req, res) => {
  const logs = [
    { timestamp: new Date(), level: 'INFO', message: 'System startup successful' },
    { timestamp: new Date(), level: 'INFO', message: 'Database connection established' },
    { timestamp: new Date(), level: 'WARN', message: 'High memory usage detected' },
  ];
  res.status(200).json({ success: true, data: logs });
};
