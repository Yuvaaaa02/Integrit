import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder
} from '../controllers/order.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const orderValidationRules = [
  body('customer').isEmail().withMessage('Please provide a valid customer email'),
  body('product').notEmpty().withMessage('Product name is required'),
  body('productSlug').notEmpty().withMessage('Product slug is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  validate
];

// Anyone can create an order (during checkout)
router.post('/', orderValidationRules, createOrder);

// Admin-only endpoints
router.get('/', authMiddleware, adminMiddleware, getAllOrders);
router.get('/:id', authMiddleware, adminMiddleware, getOrderById);
router.put('/:id/status', authMiddleware, adminMiddleware, [
  body('status').isIn(['pending', 'paid', 'failed', 'refunded']).withMessage('Invalid status'),
  validate
], updateOrderStatus);
router.put('/:id', authMiddleware, adminMiddleware, orderValidationRules, updateOrder);
router.delete('/:id', authMiddleware, adminMiddleware, deleteOrder);

export default router;
