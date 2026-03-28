const ProductService = require('../services/productService');
const { ValidationError } = require('../middleware/errorMiddleware');

class ProductController {
  constructor() {
    this.productService = new ProductService();
  }

  /**
   * Get products with filtering and pagination
   * GET /api/products
   */
  async getProducts(req, res) {
    try {
      const filters = {
        city: req.query.city,
        maxPriceUsd: req.query.maxPriceUsd ? parseFloat(req.query.maxPriceUsd) : undefined,
        condition: req.query.condition ? parseInt(req.query.condition) : undefined,
        specialOffers: req.query.specialOffers === 'true',
      };
      
      const pagination = {
        pageNumber: parseInt(req.query.pageNumber) || 1,
        pageSize: parseInt(req.query.pageSize) || 10
      };

      const result = await this.productService.getProducts(filters, pagination);
      res.json(result);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get product by ID
   * GET /api/products/:id
   */
  async getProductById(req, res) {
    try {
      const product = await this.productService.getProductById(req.params.id);
      if (!product) {
        res.status(404);
        throw new Error('Product not found');
      }
      res.json(product);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new product
   * POST /api/products
   */
  async createProduct(req, res) {
    try {
      // Validate required fields
      const requiredFields = ['title', 'description', 'price', 'currency', 'condition', 'stockQuantity', 'categoryId', 'sellerId'];
      for (const field of requiredFields) {
        if (!req.body[field]) {
          throw new ValidationError(`${field} is required`);
        }
      }

      const product = await this.productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update product
   * PUT /api/products/:id
   */
  async updateProduct(req, res) {
    try {
      // Check ID mismatch
      if (req.params.id !== req.body.id) {
        res.status(400);
        throw new Error('ID mismatch');
      }

      await this.productService.updateProduct(req.params.id, req.body);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete product
   * DELETE /api/products/:id
   */
  async deleteProduct(req, res) {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle product visibility
   * PATCH /api/products/:id/toggle-visibility
   */
  async toggleVisibility(req, res) {
    try {
      await this.productService.toggleVisibility(req.params.id);
      res.status(204).send();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get seller's products
   * GET /api/products/my-products
   */
  async getMyProducts(req, res) {
    try {
      // In a real app, we'd get the sellerId from the authenticated user
      // For now, we'll expect it as a query parameter or from auth middleware
      const sellerId = req.query.sellerId || req.user?.id;
      
      if (!sellerId) {
        res.status(401);
        throw new Error('Seller ID required');
      }

      const products = await this.productService.getMyProducts(sellerId);
      res.json(products);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload product image
   * POST /api/products/upload-image
   */
  async uploadImage(req, res) {
    try {
      if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
      }

      // Convert multer file object to match our service expectation
      const file = {
        buffer: req.file.buffer,
        originalname: req.file.originalname
      };

      const url = await this.productService.uploadImage(file);
      res.json({ secure_url: url });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductController();