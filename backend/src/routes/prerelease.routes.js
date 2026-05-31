import { Router } from 'express';
import { body } from 'express-validator';
import {
  enroll,
  getEnrollments,
  exportCsv,
  getConfig,
  updateConfig
} from '../controllers/prerelease.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const enrollmentValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email address is required').trim(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  validate
];

const configValidationRules = [
  body('enabled').optional().isBoolean().withMessage('Enabled must be a boolean'),
  body('title').optional().notEmpty().withMessage('Title cannot be empty').trim(),
  body('subtitle').optional().notEmpty().withMessage('Subtitle cannot be empty').trim(),
  body('videoUrl').optional().trim(),
  body('thumbnail').optional().trim(),
  body('ctaText').optional().trim(),
  body('badge').optional().trim(),
  validate
];

// Public routes
router.get('/config', getConfig);
router.post('/enroll', authRateLimiter, enrollmentValidationRules, enroll);

// Admin-only routes
router.get('/enrollments', authMiddleware, adminMiddleware, getEnrollments);
router.get('/export', authMiddleware, adminMiddleware, exportCsv);
router.put('/config', authMiddleware, adminMiddleware, configValidationRules, updateConfig);

export default router;
