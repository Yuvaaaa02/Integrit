import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controllers/testimonial.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const testimonialValidationRules = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('role').notEmpty().withMessage('Role/Job title is required').trim(),
  body('company').notEmpty().withMessage('Company is required').trim(),
  body('content').notEmpty().withMessage('Content is required').trim(),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  validate
];

router.get('/', getAllTestimonials);

router.post('/', authMiddleware, adminMiddleware, testimonialValidationRules, createTestimonial);
router.put('/:id', authMiddleware, adminMiddleware, testimonialValidationRules, updateTestimonial);
router.delete('/:id', authMiddleware, adminMiddleware, deleteTestimonial);

export default router;
