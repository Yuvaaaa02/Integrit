import { errorResponse } from '../utils/response.js';

/**
 * Global error handler. Catches all unhandled errors.
 */
export function errorMiddleware(err, req, res, _next) {
  console.error(`❌ [${new Date().toISOString()}] ${err.message}`);
  if (err.stack && process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File too large. Maximum size is 5MB.', 413);
  }

  // Multer file type error
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected file field.', 400);
  }

  // JSON parse error
  if (err.type === 'entity.parse.failed') {
    return errorResponse(res, 'Invalid JSON in request body.', 400);
  }

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  return errorResponse(res, message, statusCode);
}
