const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

// All admin routes require authentication
router.use(protect);

router.get('/dashboard', asyncHandler(adminController.getDashboardStats.bind(adminController)));
router.get('/users', asyncHandler(adminController.getAllUsers.bind(adminController)));
router.patch('/users/:id/block', asyncHandler(adminController.blockUser.bind(adminController)));
router.patch('/users/:id/role', asyncHandler(adminController.changeUserRole.bind(adminController)));
router.delete('/users/:id', asyncHandler(adminController.deleteUser.bind(adminController)));
router.get('/products', asyncHandler(adminController.getAllProducts.bind(adminController)));
router.delete('/products/:id', asyncHandler(adminController.deleteProduct.bind(adminController)));

module.exports = router;