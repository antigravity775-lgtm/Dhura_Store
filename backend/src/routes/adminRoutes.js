const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const orderController = require('../controllers/orderController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { changeRoleSchema, updateOrderStatusSchema } = require('../validations/adminValidation');
const { idParamSchema } = require('../validations/commonValidation');

// All admin routes require authentication and Admin role
router.use(protect, authorize('Admin'));

router.get('/dashboard', asyncHandler(adminController.getDashboardStats.bind(adminController)));
router.get('/users', asyncHandler(adminController.getAllUsers.bind(adminController)));
router.patch('/users/:id/block', validate(idParamSchema, 'params'), asyncHandler(adminController.blockUser.bind(adminController)));
router.patch('/users/:id/role', validate(idParamSchema, 'params'), validate(changeRoleSchema), asyncHandler(adminController.changeUserRole.bind(adminController)));
router.delete('/users/:id', validate(idParamSchema, 'params'), asyncHandler(adminController.deleteUser.bind(adminController)));
router.get('/products', asyncHandler(adminController.getAllProducts.bind(adminController)));
router.delete('/products/:id', validate(idParamSchema, 'params'), asyncHandler(adminController.deleteProduct.bind(adminController)));

// Order management
router.get('/orders', asyncHandler(orderController.getAllOrders.bind(orderController)));
router.patch('/orders/:id/status', validate(idParamSchema, 'params'), validate(updateOrderStatusSchema), asyncHandler(orderController.updateOrderStatus.bind(orderController)));

module.exports = router;