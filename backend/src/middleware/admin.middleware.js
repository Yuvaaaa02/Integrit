import { errorResponse } from '../utils/response.js';

/**
 * Admin role check middleware. Must be used AFTER authMiddleware.
 */
export function adminMiddleware(req, res, next) {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return errorResponse(res, 'Access denied. Admin privileges required.', 403);
  }
  next();
}
