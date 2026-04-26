const express = require('express');
const { exportDatabase, restoreDatabase } = require('../controllers/systemController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/backup', exportDatabase);
router.post('/restore', restoreDatabase);

module.exports = router;
