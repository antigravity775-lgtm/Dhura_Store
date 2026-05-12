const prisma = require('../prismaClient');
const { ValidationError } = require('../middleware/errorMiddleware');
const { uploadBuffer } = require('../utils/cloudinaryClient');


class CategoryController {
  /**
   * Get all categories
   * GET /api/categories
   */
  async getCategories(req, res) {
    try {
      const categories = await prisma.category.findMany();
      res.json(categories);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get products by category
   * GET /api/categories/:id/products
   */
  async getProductsByCategory(req, res) {
    try {
      const categoryId = req.params.id;

      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        res.status(404);
        throw new Error('Category not found');
      }

      const products = await prisma.product.findMany({
        where: { categoryId, isHidden: false },
        include: {
          seller: { select: { id: true, fullName: true, city: true, isVerified: true } }
        }
      });

      res.json(products);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload category icon image to Cloudinary
   * POST /api/categories/upload-icon
   */
  async uploadIcon(req, res) {
    try {
      if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
      }

      const url = await uploadBuffer(req.file.buffer, 'categories');
      res.json({ url });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new category
   * POST /api/categories
   */
  async createCategory(req, res) {
    try {
      if (!req.body.name) {
        throw new ValidationError('Category name is required');
      }

      const category = await prisma.category.create({
        data: {
          name: req.body.name,
          iconUrl: req.body.iconUrl || null
        }
      });

      res.status(201).json(category.id);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update category
   * PUT /api/categories/:id
   */
  async updateCategory(req, res) {
    try {
      // Accept if body has no id (mobile client), or if it matches the param
      if (req.body.id && req.params.id !== req.body.id) {
        res.status(400);
        throw new Error('ID mismatch');
      }

      const existing = await prisma.category.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        res.status(404);
        throw new Error('Category not found');
      }

      const updated = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          name: req.body.name,
          iconUrl: req.body.iconUrl || null
        }
      });

      res.status(200).json(updated);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete category
   * DELETE /api/categories/:id
   */
  async deleteCategory(req, res) {
    try {
      const existing = await prisma.category.findUnique({
        where: { id: req.params.id },
        include: { products: { select: { id: true } } }
      });
      if (!existing) {
        res.status(404);
        throw new Error('Category not found');
      }

      const productIds = existing.products.map(p => p.id);

      // Cascade delete: OrderItems -> CartItems -> Favorites -> Products -> Category
      await prisma.$transaction([
        prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } }),
        prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } }),
        prisma.favorite.deleteMany({ where: { productId: { in: productIds } } }),
        prisma.product.deleteMany({ where: { categoryId: req.params.id } }),
        prisma.category.delete({ where: { id: req.params.id } }),
      ]);

      res.status(200).json({ message: 'تم حذف القسم وجميع منتجاته بنجاح', deletedProducts: productIds.length });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CategoryController();