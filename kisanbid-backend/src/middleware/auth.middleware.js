const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

const auth = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check cookies
    else if (req.cookies && req.cookies.kisanbid_token) {
      token = req.cookies.kisanbid_token;
    }

    if (!token) {
      return ApiResponse.unauthorized(res, 'Access denied. No token provided.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return ApiResponse.unauthorized(res, 'User not found.');
    }

    if (user.status === 'banned') {
      return ApiResponse.forbidden(res, 'Your account has been banned. Reason: ' + (user.bannedReason || 'Policy violation'));
    }

    if (user.status === 'suspended' && user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
      return ApiResponse.forbidden(res, `Your account is suspended until ${user.suspendedUntil.toISOString()}`);
    }

    // If suspension expired, reactivate
    if (user.status === 'suspended' && user.suspendedUntil && new Date(user.suspendedUntil) <= new Date()) {
      user.status = 'active';
      user.suspendedUntil = null;
      user.suspendedReason = null;
      await user.save();
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, 'Token expired. Please refresh.');
    }
    if (err.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, 'Invalid token.');
    }
    return ApiResponse.error(res, 'Authentication failed.');
  }
};

module.exports = auth;
