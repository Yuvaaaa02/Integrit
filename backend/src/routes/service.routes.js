import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService
} from '../controllers/service.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const serviceValidationRules = [
  body('title').notEmpty().withMessage('Service title is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  body('icon').notEmpty().withMessage('Icon/Emoji is required').trim(),
  validate
];

router.get('/', getAllServices);
router.get('/:slug', getServiceBySlug);

router.post('/', authMiddleware, adminMiddleware, serviceValidationRules, createService);
router.put('/:slug', authMiddleware, adminMiddleware, serviceValidationRules, updateService);
router.delete('/:slug', authMiddleware, adminMiddleware, deleteService);

export default router;
