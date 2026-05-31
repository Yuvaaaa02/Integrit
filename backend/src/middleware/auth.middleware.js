import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { errorResponse } from '../utils/response.js';

/**
 * JWT authentication middleware.
 * Extracts token from Authorization header, verifies it, attaches user to req.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return errorResponse(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token expired. Please refresh.', 401);
    }
    return errorResponse(res, 'Invalid token.', 401);
  }
}

/**
 * Optional JWT authentication middleware.
 * Attempts to extract and verify token, but does not fail if missing or invalid.
 */
export function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }
  next();
}
