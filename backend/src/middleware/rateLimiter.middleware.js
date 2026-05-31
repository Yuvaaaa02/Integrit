import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

/**
 * General rate limiter for all API routes.
 */
export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    data: null,
    error: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Stricter rate limiter for auth endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    data: null,
    error: 'AUTH_RATE_LIMIT_EXCEEDED',
  },
});
