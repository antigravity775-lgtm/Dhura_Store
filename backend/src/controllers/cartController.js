const prisma = require('../prismaClient');

class CartController {
  /**
   * GET /api/cart
   * Get all cart items for the authenticated user
   */
  async getCart(req, res) {
    const userId = req.user.id;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to a shape the mobile app expects
    const items = cartItems.map((ci) => ({
      id: ci.product.id,
      title: ci.product.title,
      price: Number(ci.product.discountPrice || ci.product.price),
      originalPrice: Number(ci.product.price),
      currency: ci.product.currency,
      mainImageUrl: ci.product.mainImageUrl,
      categoryName: ci.product.category?.name || null,
      quantity: ci.quantity,
    }));

    res.status(200).json({ cartItems: items });
  }

  /**
   * POST /api/cart
   * Add or increment a product in the cart
   * Body: { productId, quantity? }
   */
  async addToCart(req, res) {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'productId is required' });
    }

    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId: { userId, productId },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: { userId, productId, quantity },
    });

    res.status(201).json({ message: 'Added to cart', id: cartItem.id, quantity: cartItem.quantity });
  }

  /**
   * PUT /api/cart/:productId
   * Set the quantity for a cart item
   * Body: { quantity }
   */
  async updateCartItem(req, res) {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity == null || quantity < 1) {
      return res.status(400).json({ message: 'quantity must be >= 1' });
    }

    await prisma.cartItem.updateMany({
      where: { userId, productId },
      data: { quantity },
    });

    res.status(200).json({ message: 'Cart updated' });
  }

  /**
   * DELETE /api/cart/:productId
   * Remove a product from the cart
   */
  async removeFromCart(req, res) {
    const userId = req.user.id;
    const { productId } = req.params;

    await prisma.cartItem.deleteMany({
      where: { userId, productId },
    });

    res.status(200).json({ message: 'Removed from cart' });
  }

  /**
   * POST /api/cart/sync
   * Bulk sync the entire cart from the mobile app.
   * Body: { items: [{ productId, quantity }] }
   * This replaces ALL server-side cart items with the provided list.
   */
  async syncCart(req, res) {
    const userId = req.user.id;
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { userId } });

      if (items.length > 0) {
        await tx.cartItem.createMany({
          data: items.map((item) => ({
            userId,
            productId: item.productId,
            quantity: item.quantity || 1,
          })),
          skipDuplicates: true,
        });
      }
    });

    res.status(200).json({ message: 'Cart synced', count: items.length });
  }

  /**
   * DELETE /api/cart
   * Clear the entire cart
   */
  async clearCart(req, res) {
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({ where: { userId } });
    res.status(200).json({ message: 'Cart cleared' });
  }
}

module.exports = new CartController();
