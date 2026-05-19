const ApiResponse = require('../utils/apiResponse');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return ApiResponse.validationError(res, message);
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query, { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join(', ');
      return ApiResponse.validationError(res, message);
    }
    next();
  };
};

module.exports = { validate, validateQuery };
