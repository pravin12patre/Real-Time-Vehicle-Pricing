// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAppStatistics } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// @route   GET /api/admin/stats
// @desc    Get application statistics
// @access  Private/Admin
router.get('/stats', protect, admin, getAppStatistics);

module.exports = router;
