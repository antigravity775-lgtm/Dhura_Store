const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const asyncHandler = require('../middleware/asyncHandler');
const multer = require('multer');
const { validate } = require('../middleware/validateMiddleware');
const { createProductSchema, updateProductSchema } = require('../validations/productValidation');
const { idParamSchema } = require('../validations/commonValidation');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Public routes
router.get('/', asyncHandler(productController.getProducts.bind(productController)));

// Protected routes (require authentication)
router.post('/', protect, authorize('Seller', 'Admin'), validate(createProductSchema), asyncHandler(productController.createProduct.bind(productController)));
router.post('/upload-image', protect, authorize('Seller', 'Admin'), upload.single('file'), asyncHandler(productController.uploadImage.bind(productController)));
router.get('/my-products', protect, asyncHandler(productController.getMyProducts.bind(productController)));

// ⚠️ :id wildcard MUST come AFTER literal routes like /my-products
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(productController.getProductById.bind(productController)));
router.put('/:id', protect, authorize('Seller', 'Admin'), validate(idParamSchema, 'params'), validate(updateProductSchema), asyncHandler(productController.updateProduct.bind(productController)));
router.delete('/:id', protect, authorize('Seller', 'Admin'), validate(idParamSchema, 'params'), asyncHandler(productController.deleteProduct.bind(productController)));
router.patch('/:id/toggle-visibility', protect, authorize('Seller', 'Admin'), validate(idParamSchema, 'params'), asyncHandler(productController.toggleVisibility.bind(productController)));

module.exports = router;