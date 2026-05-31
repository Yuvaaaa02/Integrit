import { validationResult } from 'express-validator';
import { validationErrorResponse } from '../utils/response.js';

/**
 * Validation middleware. Runs express-validator results and returns errors.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return validationErrorResponse(res, formatted);
  }
  next();
}
