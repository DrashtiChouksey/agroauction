const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const bidLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many bids placed. Please slow down.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many auth attempts. Please try again later.' } },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { apiLimiter, bidLimiter, authLimiter };
