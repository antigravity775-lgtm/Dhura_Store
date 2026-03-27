const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', asyncHandler(accountController.register.bind(accountController)));
router.post('/login', asyncHandler(accountController.login.bind(accountController)));

// Protected routes (require authentication)
router.use(protect);

router.get('/profile', asyncHandler(accountController.getProfile.bind(accountController)));
router.put('/profile', asyncHandler(accountController.updateProfile.bind(accountController)));

module.exports = router;