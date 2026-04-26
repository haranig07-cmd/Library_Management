const express = require('express');
const { issueBook, returnBook, getTransactions, getMyTransactions, requestBook, updateRequestStatus } = require('../controllers/transactionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Specific routes
router.post('/issue', protect, authorizeRoles('Admin', 'Librarian'), issueBook);
router.put('/return/:id', protect, authorizeRoles('Admin', 'Librarian'), returnBook);
router.post('/request', protect, authorizeRoles('Student', 'Faculty'), requestBook);
router.put('/request/:id', protect, authorizeRoles('Admin', 'Librarian'), updateRequestStatus);
router.get('/my', protect, authorizeRoles('Student', 'Faculty', 'Admin', 'Librarian'), getMyTransactions);

// Generic routes
router.route('/')
  .get(protect, authorizeRoles('Admin', 'Librarian'), getTransactions);

module.exports = router;
