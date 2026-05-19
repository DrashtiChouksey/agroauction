const Joi = require('joi');

const fileComplaintSchema = Joi.object({
  type: Joi.string().valid('fraud', 'quality', 'payment', 'spam', 'other').required(),
  severity: Joi.string().valid('urgent', 'high', 'medium', 'low').default('medium'),
  accusedId: Joi.string().required(),
  cropId: Joi.string().allow('', null),
  bidId: Joi.string().allow('', null),
  amount: Joi.number().positive().allow(null),
  description: Joi.string().min(10).required(),
  evidence: Joi.array().items(Joi.string().uri()),
});

module.exports = { fileComplaintSchema };
