const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.get('/', asyncHandler(categoryController.getCategories.bind(categoryController)));
router.get('/:id/products', asyncHandler(categoryController.getProductsByCategory.bind(categoryController)));

// Protected routes
router.use(protect);
router.post('/upload-icon', upload.single('file'), asyncHandler(categoryController.uploadIcon.bind(categoryController)));
router.post('/', asyncHandler(categoryController.createCategory.bind(categoryController)));
router.put('/:id', asyncHandler(categoryController.updateCategory.bind(categoryController)));
router.delete('/:id', asyncHandler(categoryController.deleteCategory.bind(categoryController)));

module.exports = router;
