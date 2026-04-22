const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/authMiddleware');

// All order routes require authentication
router.use(protect);

router.post('/', asyncHandler(orderController.createOrder.bind(orderController)));
router.get('/my-orders', asyncHandler(orderController.getMyOrders.bind(orderController)));
router.get('/track/:code', asyncHandler(orderController.trackMyOrder.bind(orderController)));
router.get('/sales', asyncHandler(orderController.getSales.bind(orderController)));
router.patch('/:id/status', asyncHandler(orderController.updateOrderStatus.bind(orderController)));

module.exports = router;