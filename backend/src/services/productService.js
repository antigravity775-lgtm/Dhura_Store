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

    // Handle promotion fields
    if (productData.isPromoted === undefined) productData.isPromoted = false;
    if (productData.discountPrice !== undefined && productData.discountPrice !== null) {
      productData.discountPrice = parseFloat(productData.discountPrice);
      if (productData.price && productData.discountPrice >= parseFloat(productData.price)) {
        throw new Error('سعر الخصم يجب أن يكون أقل من السعر الأصلي');
      }
    } else {
      productData.discountPrice = null;
    }
    if (!productData.promotionLabel) productData.promotionLabel = null;
    
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
    const { city, maxPriceUsd, condition, specialOffers } = filters;
    const { pageNumber = 1, pageSize = 10 } = pagination;
    
    // Build where clause
    const where = { isHidden: false };
    
    if (city) {
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

    // Filter for special offers (products with a discount price)
    if (specialOffers) {
      where.discountPrice = { not: null };
    }
    
    // Get total count for pagination metadata
    const totalCount = await prisma.product.count({ where });
    
    // Get products with pagination — promoted products first, then by date
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
      orderBy: [
        { isPromoted: 'desc' },
        { createdAt: 'desc' }
      ],
      skip: (pageNumber - 1) * pageSize,
      take: pageSize
    });
    
    // Apply price filter in memory (to match original behavior)
    let filteredProducts = products;
    if (maxPriceUsd !== undefined) {
      filteredProducts = products.filter(product => {
        if (product.currency === 'USD') {
          return product.price <= maxPriceUsd;
        }
        return true;
      });
    }
    
    // Add categoryName field for frontend compatibility
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

    // Handle promotion fields
    if (dataToUpdate.discountPrice !== undefined) {
      if (dataToUpdate.discountPrice !== null && dataToUpdate.discountPrice !== '') {
        dataToUpdate.discountPrice = parseFloat(dataToUpdate.discountPrice);
        // Validate discount price against original price
        const originalPrice = dataToUpdate.price !== undefined
          ? parseFloat(dataToUpdate.price)
          : (await prisma.product.findUnique({ where: { id }, select: { price: true } }))?.price;
        if (originalPrice && dataToUpdate.discountPrice >= parseFloat(originalPrice)) {
          throw new Error('سعر الخصم يجب أن يكون أقل من السعر الأصلي');
        }
      } else {
        dataToUpdate.discountPrice = null;
      }
    }
    if (dataToUpdate.promotionLabel === '') dataToUpdate.promotionLabel = null;
    
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
    return await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId: id } }),
      prisma.product.delete({ where: { id } })
    ]);
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