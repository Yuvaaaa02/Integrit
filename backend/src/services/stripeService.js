import stripe from '../config/stripe.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * Stripe Service — encapsulates all Stripe API interactions.
 * Single responsibility: talk to Stripe, return structured data.
 */

/**
 * Create a Stripe Checkout Session.
 * @param {Object} params
 * @param {string} params.productName - Display name of the product
 * @param {number} params.amount - Amount in whole currency units (e.g. 299 = $299)
 * @param {string} params.currency - Currency code (e.g. 'usd')
 * @param {number} params.quantity - Quantity of items
 * @param {string} params.customerEmail - Customer's email address
 * @param {string} params.orderId - Internal order ID for metadata
 * @param {string} params.paymentId - Internal payment ID for metadata
 * @param {string} params.productSlug - Product slug for metadata
 * @returns {Promise<{sessionId: string, checkoutUrl: string}>}
 */
export async function createCheckoutSession({
  productName,
  amount,
  currency = 'usd',
  quantity = 1,
  customerEmail,
  orderId,
  paymentId,
  productSlug,
}) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: customerEmail,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
            metadata: {
              slug: productSlug,
            },
          },
          unit_amount: Math.round(amount * 100), // Convert to cents/paise
        },
        quantity,
      },
    ],
    metadata: {
      orderId,
      paymentId,
      productSlug,
      customerEmail,
    },
    success_url: `${CLIENT_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${CLIENT_URL}/checkout/failed?session_id={CHECKOUT_SESSION_ID}`,
    expires_at: Math.floor(Date.now() / 1000) + 1800, // 30 minutes from now
  });

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
}

/**
 * Retrieve a Stripe Checkout Session by ID.
 * @param {string} sessionId
 * @returns {Promise<import('stripe').Stripe.Checkout.Session>}
 */
export async function retrieveSession(sessionId) {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });
}

/**
 * Construct and verify a Stripe webhook event.
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe-Signature header
 * @returns {import('stripe').Stripe.Event}
 */
export function constructWebhookEvent(payload, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Create a Stripe refund.
 * @param {string} paymentIntentId - The Stripe payment intent to refund
 * @param {number} [amount] - Optional partial refund amount in cents. If omitted, full refund.
 * @returns {Promise<import('stripe').Stripe.Refund>}
 */
export async function createRefund(paymentIntentId, amount) {
  const params = { payment_intent: paymentIntentId };
  if (amount) {
    params.amount = Math.round(amount);
  }
  return stripe.refunds.create(params);
}
