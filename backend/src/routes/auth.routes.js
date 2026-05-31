import { Router } from 'express';
import { body } from 'express-validator';
import { login, logout, refresh, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post(
  '/login',
  authRateLimiter,
  [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  login
);

router.post(
  '/refresh',
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate
  ],
  refresh
);

router.post('/logout', logout);

router.get('/me', authMiddleware, getMe);

export default router;
