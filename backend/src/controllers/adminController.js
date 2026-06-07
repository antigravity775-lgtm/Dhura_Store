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
      const pageNumber = parseInt(req.query.pageNumber) || 1;
      const pageSize = parseInt(req.query.pageSize) || 15;
      const search = req.query.search || '';
      const status = req.query.status || 'all'; // all, active, hidden, outofstock
      
      let whereClause = {};

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          // Prisma doesn't easily substring match UUIDs in postgres without raw query, so we do exact match if length is 36, or startsWith if supported.
          // Wait, 'contains' on String works on UUID fields if casted? No, in Prisma Postgres, String operations on UUID require specific syntax.
          // Let's search title and category name.
          { category: { name: { contains: search, mode: 'insensitive' } } }
        ];
        
        // If search looks like a partial UUID (at least 4 chars)
        if (search.length >= 4) {
          // We can't safely 'contains' a UUID field in standard prisma without throwing error if it's not a valid UUID string format.
          // We will skip UUID searching in DB unless it's exactly 36 chars.
          if (search.length === 36) {
            whereClause.OR.push({ id: search });
          }
        }
      }

      if (status === 'active') {
        whereClause.isHidden = false;
        whereClause.stockQuantity = { gt: 0 };
      } else if (status === 'hidden') {
        whereClause.isHidden = true;
      } else if (status === 'outofstock') {
        whereClause.stockQuantity = 0;
      }

      let queryArgs = {
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          seller: { select: { id: true, fullName: true } }
        }
      };

      if (pageNumber && pageSize) {
        queryArgs.skip = (pageNumber - 1) * pageSize;
        queryArgs.take = pageSize;
      }

      const products = await prisma.product.findMany(queryArgs);
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

  /**
   * Bulk update product status (isHidden)
   * PATCH /api/admin/products/bulk-status
   */
  async bulkUpdateProductStatus(req, res) {
    try {
      const { ids, isHidden } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Product IDs are required');
      }

      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { isHidden: !!isHidden }
      });

      res.status(200).json({ message: 'Products status updated successfully' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk update product category
   * PATCH /api/admin/products/bulk-category
   */
  async bulkUpdateProductCategory(req, res) {
    try {
      const { ids, categoryId } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !categoryId) {
        throw new BadRequestError('Product IDs and categoryId are required');
      }

      await prisma.product.updateMany({
        where: { id: { in: ids } },
        data: { categoryId }
      });

      res.status(200).json({ message: 'Products category updated successfully' });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bulk delete products
   * DELETE /api/admin/products/bulk-delete
   */
  async bulkDeleteProducts(req, res) {
    try {
      const { ids } = req.body; // usually in query or body (if frontend sends body with DELETE)
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new BadRequestError('Product IDs are required');
      }

      // Delete related OrderItems first
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { productId: { in: ids } } }),
        prisma.cartItem.deleteMany({ where: { productId: { in: ids } } }),
        prisma.favorite.deleteMany({ where: { productId: { in: ids } } }),
        prisma.product.deleteMany({ where: { id: { in: ids } } })
      ]);
      
      res.status(200).json({ message: 'Products deleted successfully' });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AdminController();