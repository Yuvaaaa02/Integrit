import { Router } from 'express';
import { body } from 'express-validator';
import {
  createCheckoutSessionHandler,
  verifySession,
  handleStripeWebhook,
  refundPayment,
  getPaymentStats
} from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Create Stripe checkout session
router.post(
  '/create-checkout-session',
  [
    body('customer').isEmail().withMessage('Valid customer email is required'),
    body('productSlug').notEmpty().withMessage('Product slug is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    validate
  ],
  createCheckoutSessionHandler
);

// Verify Stripe checkout session (client success fallback)
router.post(
  '/verify-session',
  [
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    validate
  ],
  verifySession
);

// Stripe Webhook (using raw body parser parsed in server.js)
router.post('/webhook', handleStripeWebhook);

// Refund completed payment (Admin only)
router.post('/refund/:transactionId', authMiddleware, adminMiddleware, refundPayment);

// Payment statistics (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, getPaymentStats);

export default router;
