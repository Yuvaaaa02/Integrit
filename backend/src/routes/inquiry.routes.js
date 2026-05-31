import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllInquiries,
  createInquiry,
  markAsRead,
  deleteInquiry
} from '../controllers/inquiry.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const inquiryValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Valid email address is required').trim(),
  body('message').notEmpty().withMessage('Message is required').trim(),
  body('type').optional().isIn(['inquiry', 'consultation']).withMessage('Type must be inquiry or consultation'),
  validate
];

// Guest contact form submission
router.post('/', inquiryValidationRules, createInquiry);

// Admin-only operations
router.get('/', authMiddleware, adminMiddleware, getAllInquiries);
router.put('/:id/read', authMiddleware, adminMiddleware, [
  body('read').isBoolean().withMessage('Read must be a boolean value'),
  validate
], markAsRead);
router.delete('/:id', authMiddleware, adminMiddleware, deleteInquiry);

export default router;
