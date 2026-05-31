/**
 * Standardized API response helpers.
 * Every response follows: { success, message, data, error }
 */

export function successResponse(res, data = null, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    error: null,
  });
}

export function errorResponse(res, message = 'Something went wrong', statusCode = 500, error = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    error: error || message,
  });
}

export function validationErrorResponse(res, errors) {
  return res.status(422).json({
    success: false,
    message: 'Validation failed',
    data: null,
    error: errors,
  });
}
