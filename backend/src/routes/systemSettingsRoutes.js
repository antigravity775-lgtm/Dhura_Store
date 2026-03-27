const express = require('express');
const router = express.Router();
const systemSettingsController = require('../controllers/systemSettingsController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

// Public read
router.get('/exchange-rates', asyncHandler(systemSettingsController.getExchangeRates.bind(systemSettingsController)));

// Admin only write
router.put('/exchange-rates', protect, asyncHandler(systemSettingsController.updateExchangeRates.bind(systemSettingsController)));

module.exports = router;
