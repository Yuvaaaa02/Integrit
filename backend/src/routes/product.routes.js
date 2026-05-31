import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Validation schema for product creation/update
const productValidationRules = [
  body('title').notEmpty().withMessage('Product title is required').trim(),
  body('category').isIn(['workflow', 'plugin', 'social']).withMessage('Category must be workflow, plugin, or social'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('shortDescription').notEmpty().withMessage('Short description is required').trim(),
  body('description').notEmpty().withMessage('Description is required').trim(),
  validate
];

router.get('/', optionalAuthMiddleware, getAllProducts);
router.get('/:slug', optionalAuthMiddleware, getProductBySlug);

router.post('/', authMiddleware, adminMiddleware, productValidationRules, createProduct);
router.put('/:slug', authMiddleware, adminMiddleware, productValidationRules, updateProduct);
router.delete('/:slug', authMiddleware, adminMiddleware, deleteProduct);

export default router;
