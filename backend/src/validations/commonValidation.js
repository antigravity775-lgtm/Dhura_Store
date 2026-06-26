const Joi = require('joi');

const idParamSchema = Joi.object({
  id: Joi.string().guid().required()
});

const idOrSlugParamSchema = Joi.object({
  id: Joi.string().required()
});

module.exports = { idParamSchema, idOrSlugParamSchema };
