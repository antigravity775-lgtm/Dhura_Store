const Joi = require('joi');

const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(100).required().messages({
    'string.empty': 'الاسم الكامل مطلوب',
    'string.min': 'الاسم يجب أن يكون 3 أحرف على الأقل',
    'any.required': 'الاسم الكامل مطلوب'
  }),
  phoneNumber: Joi.string().required().messages({
    'string.empty': 'رقم الهاتف مطلوب',
    'any.required': 'رقم الهاتف مطلوب'
  }),

  password: Joi.string().min(8).max(100).required().messages({
    'string.empty': 'كلمة المرور مطلوبة',
    'string.min': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    'any.required': 'كلمة المرور مطلوبة'
  }),
  city: Joi.string().allow('', null).optional()
});

const loginSchema = Joi.object({
  phoneNumber: Joi.string().required(),
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
  newPassword: Joi.string().min(8).max(100).required().messages({
    'string.min': 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'
  })
});

module.exports = { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema };
