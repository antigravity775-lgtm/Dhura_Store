const prisma = require('../prismaClient');
const { ValidationError, UnauthorizedError } = require('../middleware/errorMiddleware');

// Map old numeric statuses used by the frontend to Prisma enum strings
const STATUS_MAP = {
  'Pending': 'Pending',
  'Processing': 'Processing',
  'Shipped': 'Shipped',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
  1: 'Pending',
  2: 'Processing',
  3: 'Shipped',
  4: 'Delivered',
  5: 'Cancelled'
};

class OrderController {
  /**
   * Create a new order
   * POST /api/orders
   */
  async createOrder(req, res) {
    try {
      const requiredFields = ['shippingAddress', 'items'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      const buyerId = req.user?.id;
      if (!buyerId) throw new UnauthorizedError('Unauthorized');

      const { shippingAddress, paymentMethod = 'COD', items } = req.body;

      if (!Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Order must contain at least one item');
      }

      let totalAmount = 0;
      const resolvedItems = [];

      for (const item of items) {
        if (!item.productId || !item.quantity) {
          throw new ValidationError('Each item must have productId and quantity');
        }

        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new ValidationError(`Product not found: ${item.productId}`);
        if (product.isHidden) throw new ValidationError(`Product is not available: ${product.title}`);
        if (product.stockQuantity < item.quantity) {
          throw new ValidationError(`Insufficient stock for ${product.title}`);
        }

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;

        resolvedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice
        });
      }

      // Create order and items in a transaction
      const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            buyerId,
            totalAmount,
            shippingAddress,
            paymentMethod: paymentMethod || 'COD',
            status: 'Pending',
            orderItems: {
              create: resolvedItems.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
              }))
            }
          },
          include: {
            orderItems: {
              include: {
                product: {
                  select: { id: true, title: true, price: true, currency: true, mainImageUrl: true }
                }
              }
            },
            buyer: { select: { id: true, fullName: true, phoneNumber: true } }
          }
        });

        // Decrement stock for each product
        for (const item of resolvedItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } }
          });
        }

        return createdOrder;
      });

      res.status(201).json(order);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's orders
   * GET /api/orders/my-orders
   */
  async getMyOrders(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      const orders = await prisma.order.findMany({
        where: { buyerId: userId },
        include: {
          orderItems: {
            include: {
              product: {
                select: { id: true, title: true, price: true, currency: true, condition: true, mainImageUrl: true }
              }
            }
          },
          buyer: { select: { id: true, fullName: true, phoneNumber: true } }
        },
        orderBy: { orderDate: 'desc' }
      });

      res.json(orders);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get seller's sales
   * GET /api/orders/sales
   */
  async getSales(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new UnauthorizedError('Unauthorized');

      // Find orders that contain products sold by this seller
      const orders = await prisma.order.findMany({
        where: {
          orderItems: {
            some: {
              product: { sellerId: userId }
            }
          }
        },
        include: {
          buyer: { select: { id: true, fullName: true, phoneNumber: true } },
          orderItems: {
            where: {
              product: { sellerId: userId }
            },
            include: {
              product: {
                select: { id: true, title: true, price: true, currency: true, condition: true, mainImageUrl: true }
              }
            }
          }
        },
        orderBy: { orderDate: 'desc' }
      });

      res.json(orders);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order status
   * PATCH /api/orders/:id/status
   */
  async updateOrderStatus(req, res) {
    try {
      if (req.body.orderId && req.params.id !== req.body.orderId) {
        res.status(400);
        throw new Error('ID mismatch');
      }

      const rawStatus = req.body.status;
      const mappedStatus = STATUS_MAP[rawStatus];
      if (!mappedStatus) {
        res.status(400);
        throw new Error('Invalid order status. Valid values: Pending, Processing, Shipped, Delivered, Cancelled');
      }

      const order = await prisma.order.findUnique({ where: { id: req.params.id } });
      if (!order) {
        res.status(404);
        throw new Error('Order not found');
      }

      await prisma.order.update({
        where: { id: req.params.id },
        data: { status: mappedStatus }
      });

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderController();