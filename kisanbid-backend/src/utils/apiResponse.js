class ApiResponse {
  static success(res, data, message = 'Success', statusCode = 200, pagination = null) {
    const response = {
      success: true,
      data,
      message,
    };
    if (pagination) {
      response.pagination = pagination;
    }
    return res.status(statusCode).json(response);
  }

  static created(res, data, message = 'Created successfully') {
    return res.status(201).json({
      success: true,
      data,
      message,
    });
  }

  static error(res, message = 'Something went wrong', statusCode = 500, code = 'SERVER_ERROR', field = null) {
    const response = {
      success: false,
      error: {
        code,
        message,
      },
    };
    if (field) response.error.field = field;
    return res.status(statusCode).json(response);
  }

  static validationError(res, message, field = null) {
    return ApiResponse.error(res, message, 400, 'VALIDATION_ERROR', field);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.error(res, message, 401, 'UNAUTHORIZED');
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.error(res, message, 403, 'FORBIDDEN');
  }

  static notFound(res, message = 'Resource not found') {
    return ApiResponse.error(res, message, 404, 'NOT_FOUND');
  }

  static paginated(res, data, total, page, limit, message = 'Fetched successfully') {
    const totalPages = Math.ceil(total / limit);
    return ApiResponse.success(res, data, message, 200, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
    });
  }
}

module.exports = ApiResponse;
