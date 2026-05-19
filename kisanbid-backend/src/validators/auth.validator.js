const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('farmer', 'buyer').required(),
  phone: Joi.string().allow(''),
  location: Joi.string().allow(''),
  state: Joi.string().allow(''),
  farmSize: Joi.string().allow(''),
  cropTypes: Joi.array().items(Joi.string()),
  isOrganic: Joi.boolean(),
  companyName: Joi.string().allow(''),
  preferredCrops: Joi.array().items(Joi.string()),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const adminLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  secretCode: Joi.string().required(),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).max(128).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};
