const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimitMiddleware');

// Public routes
router.get('/', asyncHandler(categoryController.getCategories.bind(categoryController)));
router.get('/:id/products', asyncHandler(categoryController.getProductsByCategory.bind(categoryController)));

// Admin-only mutating routes
router.use(protect, authorize('Admin'));
router.post('/upload-icon', uploadLimiter, imageUpload.single('file'), asyncHandler(categoryController.uploadIcon.bind(categoryController)));
router.post('/', asyncHandler(categoryController.createCategory.bind(categoryController)));
router.put('/:id', asyncHandler(categoryController.updateCategory.bind(categoryController)));
router.delete('/:id', asyncHandler(categoryController.deleteCategory.bind(categoryController)));

module.exports = router;
