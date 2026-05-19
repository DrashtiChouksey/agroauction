const Joi = require('joi');

const placeBidSchema = Joi.object({
  cropId: Joi.string().required(),
  bidAmount: Joi.number().positive().required(),
  isAutoBid: Joi.boolean().default(false),
  autoBidMax: Joi.number().positive().allow(null).optional(),
});

module.exports = { placeBidSchema };
