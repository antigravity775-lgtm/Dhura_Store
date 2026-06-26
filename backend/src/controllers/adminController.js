const prisma = require('../prismaClient');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');
const AuthService = require('../services/authService');
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

      const newBlockedState = !user.isBlocked;

      await prisma.user.update({
        where: { id: req.params.id },
        data: { isBlocked: newBlockedState }
      });

      if (newBlockedState) {
        await new AuthService().revokeAllUserTokens(req.params.id);
      }

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

  /**
   * Download a full local backup of the database as a .json.gz file
   * GET /api/admin/backup
   */
  async downloadBackup(req, res) {
    try {
      // 1. Fetch all critical tables sequentially to avoid connection pool exhaustion (limit=1)
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
      const categories = await prisma.category.findMany();
      const products = await prisma.product.findMany();
      const orders = await prisma.order.findMany();
      const orderItems = await prisma.orderItem.findMany();
      const systemSettings = await prisma.systemSetting.findMany();
      const banners = await prisma.banner.findMany();
      const cartItems = await prisma.cartItem.findMany();
      const favorites = await prisma.favorite.findMany();

      // 2. Build the backup object with metadata
      const backupData = {
        metadata: {
          appName: 'Teeb_Store',
          version: '1.0',
          generatedAt: new Date().toISOString(),
          generatedBy: req.user?.id || 'Unknown Admin',
          tablesExported: 9
        },
        data: {
          users,
          categories,
          products,
          orders,
          orderItems,
          systemSettings,
          banners,
          cartItems,
          favorites
        }
      };

      // 3. Log the audit event
      if (req.user && req.user.id) {
        await prisma.auditLog.create({
          data: {
            action: 'BACKUP_DOWNLOADED',
            userId: req.user.id,
            details: 'Admin downloaded full database backup',
            ipAddress: req.ip || req.connection?.remoteAddress || null
          }
        });
      }

      // 4. Compress the output (.json.gz)
      const jsonString = JSON.stringify(backupData);
      
      const dateStr = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Disposition', `attachment; filename="teeb_backup_${dateStr}.json.gz"`);
      res.setHeader('Content-Type', 'application/gzip');

      const gzip = zlib.createGzip();
      gzip.pipe(res);
      gzip.write(jsonString);
      gzip.end();
      
    } catch (error) {
      console.error('Backup generation failed:', error);
      throw error;
    }
  }

  /**
   * Restore database from a .json.gz backup file
   * POST /api/admin/restore
   */
  async restoreBackup(req, res) {
    if (!req.file) {
      throw new BadRequestError('لم يتم رفع أي ملف');
    }

    try {
      // 1. Decompress and parse
      let jsonString;
      try {
        jsonString = zlib.gunzipSync(req.file.buffer).toString('utf-8');
      } catch (err) {
        // Fallback: maybe it's already uncompressed JSON
        jsonString = req.file.buffer.toString('utf-8');
      }

      let backupPayload;
      try {
        backupPayload = JSON.parse(jsonString);
      } catch (err) {
        throw new BadRequestError('الملف لا يحتوي على بيانات JSON صالحة. يرجى التأكد من رفع ملف النسخة الاحتياطية الصحيح.');
      }

      // 2. Validation
      const { metadata, data } = backupPayload;
      if (!metadata || !data) {
        throw new BadRequestError('هيكل ملف النسخ الاحتياطي غير صالح');
      }
      
      // Allow if appName is exactly 'Teeb_Store', or if it's missing but version is 1.0 (for backups generated right before the update)
      if (metadata.appName && metadata.appName !== 'Teeb_Store') {
        throw new BadRequestError('هذا الملف لا يخص هذا التطبيق (تطبيق غير متطابق)');
      }
      
      if (metadata.version !== '1.0') {
        throw new BadRequestError('إصدار ملف النسخ الاحتياطي غير متوافق');
      }

      const requiredTables = ['users', 'categories', 'products', 'orders', 'orderItems', 'systemSettings', 'banners', 'cartItems', 'favorites'];
      for (const table of requiredTables) {
        if (!Array.isArray(data[table])) {
          throw new BadRequestError(`الجدول المطلوب مفقود أو غير صالح: ${table}`);
        }
      }

      // 3. Pre-Restore Backup
      try {
        const backupsDir = path.join(__dirname, '../../uploads/backups');
        if (!fs.existsSync(backupsDir)) {
          fs.mkdirSync(backupsDir, { recursive: true });
        }
        
        // Fetch current DB state sequentially to avoid connection pool timeouts
        const currentUsers = await prisma.user.findMany();
        const currentCategories = await prisma.category.findMany();
        const currentProducts = await prisma.product.findMany();
        const currentOrders = await prisma.order.findMany();
        const currentOrderItems = await prisma.orderItem.findMany();
        const currentSystemSettings = await prisma.systemSetting.findMany();
        const currentBanners = await prisma.banner.findMany();
        const currentCartItems = await prisma.cartItem.findMany();
        const currentFavorites = await prisma.favorite.findMany();

        const preRestoreData = {
          metadata: {
            appName: 'Teeb_Store',
            version: '1.0',
            generatedAt: new Date().toISOString(),
            generatedBy: 'SYSTEM_PRE_RESTORE',
            tablesExported: 9
          },
          data: {
            users: currentUsers, categories: currentCategories, products: currentProducts,
            orders: currentOrders, orderItems: currentOrderItems, systemSettings: currentSystemSettings,
            banners: currentBanners, cartItems: currentCartItems, favorites: currentFavorites
          }
        };

        const preRestoreJson = JSON.stringify(preRestoreData);
        const preRestoreGzip = zlib.gzipSync(preRestoreJson);
        const backupPath = path.join(backupsDir, `pre-restore-${Date.now()}.json.gz`);
        fs.writeFileSync(backupPath, preRestoreGzip);
      } catch (err) {
        console.error('Pre-restore backup failed:', err);
        throw new Error('فشل إنشاء نسخة احتياطية قبل الاستعادة. تم إيقاف العملية لحماية البيانات.');
      }

      // 4. Wipe & Restore inside a single transaction
      await prisma.$transaction(async (tx) => {
        // Fetch existing AuditLogs to preserve them
        const existingAuditLogs = await tx.auditLog.findMany();

        // --- WIPE ---
        await tx.orderItem.deleteMany();
        await tx.cartItem.deleteMany();
        await tx.favorite.deleteMany();
        await tx.order.deleteMany();
        await tx.product.deleteMany();
        await tx.auditLog.deleteMany(); 
        await tx.user.deleteMany();
        await tx.category.deleteMany();
        await tx.banner.deleteMany();
        await tx.systemSetting.deleteMany();

        // --- RESTORE ---
        if (data.users.length > 0) await tx.user.createMany({ data: data.users });
        if (data.categories.length > 0) await tx.category.createMany({ data: data.categories });
        if (data.banners.length > 0) await tx.banner.createMany({ data: data.banners });
        if (data.systemSettings.length > 0) await tx.systemSetting.createMany({ data: data.systemSettings });
        if (data.products.length > 0) await tx.product.createMany({ data: data.products });
        if (data.orders.length > 0) await tx.order.createMany({ data: data.orders });
        if (data.orderItems.length > 0) await tx.orderItem.createMany({ data: data.orderItems });
        if (data.cartItems.length > 0) await tx.cartItem.createMany({ data: data.cartItems });
        if (data.favorites.length > 0) await tx.favorite.createMany({ data: data.favorites });

        // Restore preserved AuditLogs (adjust userId if the user doesn't exist in the restored backup)
        if (existingAuditLogs.length > 0) {
          const validUserIds = new Set(data.users.map(u => u.id));
          const adjustedLogs = existingAuditLogs.map(log => ({
            ...log,
            userId: log.userId && validUserIds.has(log.userId) ? log.userId : null
          }));
          await tx.auditLog.createMany({ data: adjustedLogs });
        }

        // Add new AuditLog for this restore
        await tx.auditLog.create({
          data: {
            action: 'DATABASE_RESTORED',
            userId: req.user?.id || null,
            details: 'Admin restored database from backup file',
            ipAddress: req.ip || req.connection?.remoteAddress || null
          }
        });
      }, {
        timeout: 60000 // 60 seconds timeout for large DBs
      });

      res.status(200).json({ message: 'تم استعادة قاعدة البيانات بنجاح' });

    } catch (error) {
      console.error('Restore failed:', error);
      if (error instanceof BadRequestError) {
        throw error;
      }
      throw new Error(error.message || 'فشل أثناء استعادة قاعدة البيانات');
    }
  }
}

module.exports = new AdminController();