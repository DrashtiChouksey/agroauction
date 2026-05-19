const ApiResponse = require('../utils/apiResponse');

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `Access restricted to: ${roles.join(', ')}`);
    }
    next();
  };
};

const farmerOnly = requireRole('farmer', 'admin');
const buyerOnly = requireRole('buyer', 'admin');
const farmerOrBuyer = requireRole('farmer', 'buyer', 'admin');

module.exports = { requireRole, farmerOnly, buyerOnly, farmerOrBuyer };
