const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  city: Joi.string().allow('', null).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).optional(),
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().allow('', null).optional(),
  city: Joi.string().allow('', null).optional(),
  userId: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});

module.exports = { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };
