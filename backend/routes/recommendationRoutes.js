const express = require('express');
const { createRecommendation, getRecommendations, updateRecommendationStatus } = require('../controllers/recommendationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorizeRoles('Faculty'), createRecommendation)
  .get(authorizeRoles('Librarian', 'Admin'), getRecommendations);

router.route('/:id')
  .put(authorizeRoles('Librarian', 'Admin'), updateRecommendationStatus);

module.exports = router;
