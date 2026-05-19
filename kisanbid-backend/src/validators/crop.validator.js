const Joi = require('joi');

const createCropSchema = Joi.object({
  cropName: Joi.string().trim().min(2).max(100).required(),
  variety: Joi.string().allow(''),
  quantity: Joi.number().positive().required(),
  quantityUnit: Joi.string().valid('kg', 'quintal', 'ton').default('quintal'),
  basePrice: Joi.number().positive().required(),
  reservePrice: Joi.number().positive().allow(null),
  autoAcceptPrice: Joi.number().positive().allow(null),
  photoUrl: Joi.string().uri().allow(''),
  photos: Joi.array().items(Joi.string().uri()),
  harvestDate: Joi.date(),
  season: Joi.string().valid('Kharif', 'Rabi', 'Summer', 'Zaid'),
  grade: Joi.string().valid('A+', 'A', 'B', 'C'),
  isOrganic: Joi.boolean().default(false),
  description: Joi.string().max(1000).allow(''),
  storageConditions: Joi.string().max(500).allow(''),
  expiresAt: Joi.date(),
});

const updateCropSchema = Joi.object({
  cropName: Joi.string().trim().min(2).max(100),
  variety: Joi.string().allow(''),
  quantity: Joi.number().positive(),
  quantityUnit: Joi.string().valid('kg', 'quintal', 'ton'),
  basePrice: Joi.number().positive(),
  reservePrice: Joi.number().positive().allow(null),
  autoAcceptPrice: Joi.number().positive().allow(null),
  photoUrl: Joi.string().uri().allow(''),
  photos: Joi.array().items(Joi.string().uri()),
  harvestDate: Joi.date(),
  season: Joi.string().valid('Kharif', 'Rabi', 'Summer', 'Zaid'),
  grade: Joi.string().valid('A+', 'A', 'B', 'C'),
  isOrganic: Joi.boolean(),
  description: Joi.string().max(1000).allow(''),
  storageConditions: Joi.string().max(500).allow(''),
}).min(1);

module.exports = { createCropSchema, updateCropSchema };
