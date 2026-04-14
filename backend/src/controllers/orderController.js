const prisma = require('../prismaClient');
const { ValidationError, UnauthorizedError } = require('../middleware/errorMiddleware');

// Map old numeric statuses used by the frontend to Prisma enum strings
const STATUS_MAP = {
  'Pending': 'Pending',
  'Confirmed': 'Confirmed',
  'Processing': 'Processing',
  'Shipped': 'Shipped',
  'Delivered': 'Delivered',
  'Cancelled': 'Cancelled',
  1: 'Pending',
  2: 'Confirmed',
  3: 'Processing',
  4: 'Shipped',
  5: 'Delivered',
  6: 'Cancelled'
};

// Statuses where stock has been decremented
const STOCK_DECREMENTED_STATUSES = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];

class OrderController {
  /**
   * Create a new order
   * POST /api/orders
   * Stock is validated but NOT decremented — admin must approve first.
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
          throw new ValidationError(`الكمية المطلوبة من "${product.title}" (${item.quantity}) تتجاوز المخزون المتاح (${product.stockQuantity})`);
        }

        const unitPrice = Number(product.price);
        totalAmount += unitPrice * item.quantity;

        resolvedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice
        });
      }

      // Create order and items — stock is NOT decremented yet (admin approval required)
      const order = await prisma.order.create({
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
   * Get all orders (Admin only)
   * GET /api/admin/orders?status=Pending&search=...
   */
  async getAllOrders(req, res) {
    try {
      const { status, search } = req.query;

      const where = {};

      // Filter by status
      if (status && status !== 'All') {
        const mappedStatus = STATUS_MAP[status];
        if (mappedStatus) {
          where.status = mappedStatus;
        }
      }

      // Search by buyer name or order ID
      if (search && search.trim()) {
        where.OR = [
          { buyer: { fullName: { contains: search, mode: 'insensitive' } } },
          { id: { contains: search, mode: 'insensitive' } }
        ];
      }

      const orders = await prisma.order.findMany({
        where,
        include: {
          buyer: { select: { id: true, fullName: true, phoneNumber: true, email: true } },
          orderItems: {
            include: {
              product: {
                select: { id: true, title: true, price: true, currency: true, mainImageUrl: true, stockQuantity: true }
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
   * Update order status (Admin)
   * PATCH /api/admin/orders/:id/status
   *
   * When approving (→ Confirmed): validates + decrements stock
   * When cancelling a confirmed order: restores stock
   */
  async updateOrderStatus(req, res) {
    try {
      const rawStatus = req.body.status;
      const mappedStatus = STATUS_MAP[rawStatus];
      if (!mappedStatus) {
        throw new ValidationError('Invalid order status. Valid values: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled');
      }

      const order = await prisma.order.findUnique({
        where: { id: req.params.id },
        include: {
          orderItems: {
            include: {
              product: { select: { id: true, title: true, stockQuantity: true } }
            }
          }
        }
      });

      if (!order) {
        throw new ValidationError('Order not found');
      }

      const oldStatus = order.status;
      const newStatus = mappedStatus;

      // Prevent no-op
      if (oldStatus === newStatus) {
        return res.status(200).json({ message: 'Status unchanged' });
      }

      // ── APPROVING: Decrement stock ──
      // Moving from a non-decremented status to a decremented status
      const wasDecremented = STOCK_DECREMENTED_STATUSES.includes(oldStatus);
      const willDecrement = STOCK_DECREMENTED_STATUSES.includes(newStatus);

      if (!wasDecremented && willDecrement) {
        // Validate stock availability before approving
        for (const item of order.orderItems) {
          if (item.product.stockQuantity < item.quantity) {
            throw new ValidationError(
              `المخزون غير كافي للمنتج "${item.product.title}". المطلوب: ${item.quantity}, المتاح: ${item.product.stockQuantity}`
            );
          }
        }

        // Decrement stock in a batch transaction (avoids interactive transaction timeout)
        await prisma.$transaction([
          prisma.order.update({
            where: { id: req.params.id },
            data: { status: newStatus }
          }),
          ...order.orderItems.map(item =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { decrement: item.quantity } }
            })
          )
        ]);
      }
      // ── CANCELLING: Restore stock if it was previously decremented ──
      else if (wasDecremented && newStatus === 'Cancelled') {
  await prisma.$transaction([
          prisma.order.update({
            where: { id: req.params.id },
            data: { status: newStatus }
          }),
          ...order.orderItems.map(item =>
            prisma.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } }
            })
          )
        ]);
      }
      // ── SIMPLE STATUS CHANGE (no stock impact) ──
      else {
        await prisma.order.update({
          where: { id: req.params.id },
          data: { status: newStatus }
        });
      }

      res.status(200).json({ message: 'تم تحديث حالة الطلب بنجاح', status: newStatus });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new OrderController();