const express = require('express');
const { getBooks, getBook, createBook, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Publicly readable routes (if logged in)
router.route('/')
  .get(protect, getBooks)
  .post(protect, authorizeRoles('Admin', 'Librarian'), createBook);

router.route('/:id')
  .get(protect, getBook)
  .put(protect, authorizeRoles('Admin', 'Librarian'), updateBook)
  .delete(protect, authorizeRoles('Admin', 'Librarian'), deleteBook);

module.exports = router;
