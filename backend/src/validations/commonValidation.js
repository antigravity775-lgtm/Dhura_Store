const Joi = require('joi');

const idParamSchema = Joi.object({
  id: Joi.string().guid({ version: ['uuidv4', 'uuidv5'] }).required()
});

module.exports = { idParamSchema };
