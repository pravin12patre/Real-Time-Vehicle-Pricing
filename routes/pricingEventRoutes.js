// routes/pricingEventRoutes.js
const express = require('express');
const router = express.Router();
const { logPricingEvent } = require('../controllers/pricingEventController');
const { protect } = require('../middleware/authMiddleware'); // Only authenticated users can log

// @route   POST /api/pricing-events/log
// @desc    Log a vehicle pricing event
// @access  Private
router.post('/log', protect, logPricingEvent);

module.exports = router;
