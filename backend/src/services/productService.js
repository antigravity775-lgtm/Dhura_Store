const prisma = require('../prismaClient');
const { randomUUID } = require('crypto');
const { uploadBuffer } = require('../utils/cloudinaryClient');

class ProductService {
  constructor() {}

  /**
   * Create a new product
   * @param {Object} productData - The product data
   * @returns {Promise<Object>} The created product
   */
  async createProduct(productData) {
    // Generate UUID for Id (to match C# Guid)
    productData.id = randomUUID();
    // Set CreatedAt to current UTC time
    productData.createdAt = new Date();
    // Set IsHidden to false by default
    productData.isHidden = false;
    
    // Map integer condition to Prisma string
    const conditionMap = { 1: 'New', 2: 'Used', 3: 'Refurbished' };
    if (productData.condition) {
      productData.condition = conditionMap[productData.condition] || productData.condition;
    }
    
    return await prisma.product.create({ 
      data: productData,
      include: {
        category: {
          select: { name: true }
        },
        seller: {
          select: { 
            fullName: true, 
            city: true, 
            isVerified: true 
          }
        }
      }
    });
  }

  /**
   * Get products with filtering and pagination
   * @param {Object} filters - Filter criteria (city, maxPriceUsd, condition)
   * @param {Object} pagination - Pagination info (pageNumber, pageSize)
   * @returns {Promise<Array>} List of products
   */
  async getProducts(filters, pagination) {
    const { city, maxPriceUsd, condition } = filters;
    const { pageNumber = 1, pageSize = 10 } = pagination;
    
    // Build where clause
    const where = { isHidden: false };
    
    if (city) {
      // Note: This requires joining with User table
      // We'll handle this in the query by using findMany with include and filtering
      // For better performance, we'd do this in a raw query or with proper joins
      where.seller = { 
        city: { 
          mode: 'insensitive', 
          equals: city 
        } 
      };
    }
    
    // Map integer condition to Prisma enum string
    const conditionMap = { 1: 'New', 2: 'Used', 3: 'Refurbished' };
    if (condition !== undefined) {
      where.condition = conditionMap[condition] || condition;
    }
    
    // Note: Price filtering with currency conversion would require a raw query or computed field
    // For now, we'll fetch all products and filter in memory (as in the original implementation)
    // In a production app, you might want to store prices in a base currency or use a computed field
    
    // Get total count for pagination metadata
    const totalCount = await prisma.product.count({ where });
    
    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        },
        seller: {
          select: { 
            fullName: true, 
            city: true, 
            isVerified: true 
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize
    });
    
    // Apply price filter in memory (to match original behavior)
    // This is not ideal for large datasets but maintains compatibility with original logic
    let filteredProducts = products;
    if (maxPriceUsd !== undefined) {
      // We'll need a currency converter service for proper filtering
      // For now, we'll just return products as-is and note that price filtering needs improvement
      // In a real implementation, we'd either:
      // 1. Store all prices in a base currency (e.g., USD) 
      // 2. Use a database function/computed field for conversion
      // 3. Filter in memory as we're doing here (not scalable)
      filteredProducts = products.filter(product => {
        // Simplified: if product is in USD, direct comparison
        if (product.currency === 'USD') {
          return product.price <= maxPriceUsd;
        }
        // For other currencies, we would need to convert - skipping for now
        // This is a limitation of the current approach
        return true;
      });
    }
    
    // Add categoryName field for frontend compatibility (products include category object)
    return filteredProducts.map(p => ({
      ...p,
      categoryName: p.category?.name || null
    }));
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} The product
   */
  async getProductById(id) {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { name: true } },
        seller: { select: { fullName: true, city: true, isVerified: true } }
      }
    });
    if (!p) return null;
    return { ...p, categoryName: p.category?.name || null };
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} The updated product
   */
  async updateProduct(id, updateData) {
    // Remove fields that shouldn't be updated
    const { id: _, createdAt: __, sellerId: ___, ...dataToUpdate } = updateData;
    
    // Map integer condition to Prisma string
    const conditionMap = { 1: 'New', 2: 'Used', 3: 'Refurbished' };
    if (dataToUpdate.condition) {
      dataToUpdate.condition = conditionMap[dataToUpdate.condition] || dataToUpdate.condition;
    }
    
    return await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: {
        category: {
          select: { name: true }
        },
        seller: {
          select: { 
            fullName: true, 
            city: true, 
            isVerified: true 
          }
        }
      }
    });
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(id) {
    return await prisma.product.delete({ where: { id } });
  }

  /**
   * Toggle product visibility (hide/unhide)
   * @param {string} id - Product ID
   * @returns {Promise<void>}
   */
  async toggleVisibility(id) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new Error('Product not found');
    }
    
    return await prisma.product.update({
      where: { id },
      data: { isHidden: !product.isHidden }
    });
  }

  /**
   * Get products by seller ID
   * @param {string} sellerId - Seller ID
   * @returns {Promise<Array>} List of products
   */
  async getMyProducts(sellerId) {
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: {
        category: { select: { name: true } },
        seller: { select: { fullName: true, city: true, isVerified: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return products.map(p => ({ ...p, categoryName: p.category?.name || null }));
  }

  /**
   * Upload product image to Cloudinary
   * @param {Object} file - The uploaded file (with a buffer property)
   * @returns {Promise<string>} The secure Cloudinary URL
   */
  async uploadImage(file) {
    if (!file || !file.buffer) {
      throw new Error('No file uploaded');
    }
    return uploadBuffer(file.buffer, 'products');
  }
}

module.exports = ProductService;