const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public routes
router.get('/', asyncHandler(productController.getProducts.bind(productController)));
router.get('/:id', asyncHandler(productController.getProductById.bind(productController)));

// Protected routes (require authentication)
router.post('/', protect, asyncHandler(productController.createProduct.bind(productController)));
router.post('/upload-image', protect, upload.single('file'), asyncHandler(productController.uploadImage.bind(productController)));
router.get('/my-products', protect, asyncHandler(productController.getMyProducts.bind(productController)));
router.put('/:id', protect, asyncHandler(productController.updateProduct.bind(productController)));
router.delete('/:id', protect, asyncHandler(productController.deleteProduct.bind(productController)));
router.patch('/:id/toggle-visibility', protect, asyncHandler(productController.toggleVisibility.bind(productController)));

module.exports = router;