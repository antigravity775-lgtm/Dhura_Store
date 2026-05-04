const prisma = require('../prismaClient');
const { ValidationError, BadRequestError } = require('../middleware/errorMiddleware');

class AdminController {
  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard
   */
  async getDashboardStats(req, res) {
    try {
      const [
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingOrders
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'Seller' } }),
        prisma.product.count({ where: { isHidden: false } }),
        prisma.order.count(),
        prisma.order.count({ where: { status: 'Pending' } })
      ]);

      res.json({
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingOrders
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          fullName: true,
          phoneNumber: true,
          email: true,
          role: true,
          city: true,
          isVerified: true,
          isBlocked: true,
          createdAt: true,
          updatedAt: true
        }
      });
      res.json(users);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Block/unblock user
   * PATCH /api/admin/users/:id/block
   */
  async blockUser(req, res) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      await prisma.user.update({
        where: { id: req.params.id },
        data: { isBlocked: !user.isBlocked }
      });

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user role
   * PATCH /api/admin/users/:id/role
   */
  async changeUserRole(req, res) {
    try {
      const { newRole } = req.body;

      const validRoles = ['Admin', 'Seller', 'Buyer'];
      if (!newRole || !validRoles.includes(newRole)) {
        throw new BadRequestError('Invalid role');
      }

      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      await prisma.user.update({
        where: { id: req.params.id },
        data: { role: newRole }
      });

      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res) {
    try {
      const user = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }

      await prisma.user.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all products (for admin)
   * GET /api/admin/products
   */
  async getAllProducts(req, res) {
    try {
      const products = await prisma.product.findMany({
        include: {
          category: { select: { id: true, name: true } },
          seller: { select: { id: true, fullName: true } }
        }
      });
      // Add flat fields for frontend compatibility
      const mapped = products.map(p => ({
        ...p,
        categoryName: p.category?.name || null,
        sellerName: p.seller?.fullName || null
      }));
      res.json(mapped);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product (for admin)
   * DELETE /api/admin/products/:id
   */
  async deleteProduct(req, res) {
    try {
      const product = await prisma.product.findUnique({ where: { id: req.params.id } });
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }

      // Delete related OrderItems first to avoid foreign key constraint violations
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { productId: req.params.id } }),
        prisma.product.delete({ where: { id: req.params.id } })
      ]);
      
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminController();