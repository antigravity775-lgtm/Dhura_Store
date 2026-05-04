const Joi = require('joi');

const createProductSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  price: Joi.number().positive().required(),
  currency: Joi.string().valid('USD', 'YER_Sanaa', 'YER_Aden', 'SAR').required(),
  condition: Joi.number().valid(1, 2, 3).required(),
  stockQuantity: Joi.number().integer().min(0).required(),
  categoryId: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required(),
  sellerId: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).optional(),
  isPromoted: Joi.boolean().optional(),
  discountPrice: Joi.number().positive().allow(null, '').optional(),
  promotionLabel: Joi.string().allow(null, '').optional()
});

const updateProductSchema = createProductSchema.keys({
  id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required()
});

module.exports = { createProductSchema, updateProductSchema };
