import razorpay from '../config/razorpay.js';
import crypto from 'node:crypto';

/**
 * Razorpay Service — encapsulates all Razorpay API interactions.
 */

/**
 * Create a Razorpay Order.
 * @param {Object} params
 * @param {number} params.amount - Amount in whole currency units (e.g. 299 = $299)
 * @param {string} params.currency - Currency code (e.g. 'USD' or 'INR')
 * @param {string} params.receipt - Internal order ID for reference
 * @param {Object} [params.notes] - Metadata notes
 * @returns {Promise<Object>}
 */
export async function createRazorpayOrder({ amount, currency = 'USD', receipt, notes = {} }) {
  const options = {
    amount: Math.round(amount * 100), // convert to lowest denomination (paisa/cents)
    currency: currency.toUpperCase(),
    receipt: receipt,
    notes: notes,
  };
  return razorpay.orders.create(options);
}

/**
 * Verify Razorpay Payment Signature (Client-side callback signature verification).
 * @param {string} razorpayOrderId
 * @param {string} razorpayPaymentId
 * @param {string} signature
 * @returns {boolean}
 */
export function verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured');
  }
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}

/**
 * Verify Razorpay Webhook Signature.
 * @param {Buffer|string} payload - Raw request body
 * @param {string} signature - x-razorpay-signature header
 * @returns {boolean}
 */
export function verifyWebhookSignature(payload, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured');
  }
  
  // Use raw payload string or buffer for verification
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(data)
    .digest('hex');
    
  return expectedSignature === signature;
}

/**
 * Create a Razorpay Refund.
 * @param {string} paymentId - The Razorpay payment ID to refund
 * @param {number} [amount] - Optional partial refund amount in whole units. If omitted, full refund.
 * @returns {Promise<Object>}
 */
export async function createRazorpayRefund(paymentId, amount) {
  const options = {};
  if (amount) {
    options.amount = Math.round(amount * 100); // convert to lowest denomination
  }
  return razorpay.payments.refund(paymentId, options);
}
