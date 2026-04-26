const express = require('express');
const { getSystemStats, getSystemLogs } = require('../controllers/systemController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('Admin'));

router.get('/stats', getSystemStats);
router.get('/logs', getSystemLogs);

module.exports = router;
