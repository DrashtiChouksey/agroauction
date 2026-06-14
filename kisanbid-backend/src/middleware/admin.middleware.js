const ApiResponse = require('../utils/apiResponse');

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return ApiResponse.forbidden(res, 'Admin access required.');
  }
  next();
};

module.exports = adminOnly;
