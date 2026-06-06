import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrderHandler,
  verifyPaymentHandler,
  getPaymentStatusHandler,
  handleRazorpayWebhook,
  refundPayment,
  getPaymentStats
} from '../controllers/payment.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

// Create Razorpay order
router.post(
  '/create-order',
  [
    body('customer').isEmail().withMessage('Valid customer email is required'),
    body('productSlug').notEmpty().withMessage('Product slug is required'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    validate
  ],
  createOrderHandler
);

// Verify Razorpay payment signature
router.post(
  '/verify-payment',
  [
    body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
    validate
  ],
  verifyPaymentHandler
);

// Retrieve payment status
router.get('/status/:paymentId', getPaymentStatusHandler);

// Razorpay Webhook
router.post('/webhook', handleRazorpayWebhook);

// Refund completed payment (Admin only)
router.post('/refund/:transactionId', authMiddleware, adminMiddleware, refundPayment);

// Payment statistics (Admin only)
router.get('/stats', authMiddleware, adminMiddleware, getPaymentStats);

export default router;
