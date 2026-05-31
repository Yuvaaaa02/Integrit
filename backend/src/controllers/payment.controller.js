import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  createCheckoutSession as stripeCreateCheckoutSession,
  retrieveSession,
  constructWebhookEvent,
  createRefund as stripeCreateRefund,
} from '../services/stripeService.js';

const paymentStore = new JsonStore('payments.json');
const orderStore = new JsonStore('orders.json');
const transactionStore = new JsonStore('transactions.json');
const invoiceStore = new JsonStore('invoices.json');
const refundStore = new JsonStore('refunds.json');
const productStore = new JsonStore('products.json');
const analyticsStore = new JsonStore('analytics.json');

// ─── Helpers ────────────────────────────────────────────────

function generateOrderId() {
  return 'ord_' + Math.floor(1000 + Math.random() * 9000);
}

function generateInvoiceId() {
  return 'inv_' + Math.floor(10000 + Math.random() * 90000);
}

// ─── Create Checkout Session ────────────────────────────────

/**
 * POST /api/payments/create-checkout-session
 *
 * Creates a Stripe Checkout Session. Server-side price lookup ensures
 * the frontend can never manipulate the charged amount.
 *
 * Body: { customer: string (email), productSlug: string, quantity?: number }
 */
export async function createCheckoutSessionHandler(req, res, next) {
  try {
    const { customer, productSlug, quantity = 1 } = req.body;

    if (!customer || !productSlug) {
      return errorResponse(res, 'Customer email and product slug are required', 400);
    }

    // ── Server-side product lookup (NEVER trust frontend price) ──
    const product = await productStore.findOne({ slug: productSlug });
    if (!product) {
      return errorResponse(res, `Product '${productSlug}' not found`, 404);
    }

    const amount = product.price; // Whole-dollar amount from DB
    const currency = (product.currency || 'USD').toLowerCase();

    // ── Create order ──
    const orderId = generateOrderId();
    const formattedDate = new Date().toISOString().split('T')[0];

    const newOrder = {
      orderId,
      customer,
      product: product.title,
      productSlug: product.slug,
      amount,
      currency: currency.toUpperCase(),
      gateway: 'stripe',
      status: 'pending',
      date: formattedDate,
    };
    await orderStore.create(newOrder);

    // ── Create pending payment record ──
    const pendingPayment = {
      orderId,
      customer,
      amount,
      currency: currency.toUpperCase(),
      gateway: 'stripe',
      status: 'pending',
      stripeSessionId: null, // Set after Stripe call
      stripePaymentIntentId: null,
      paymentMethod: 'card',
    };
    const createdPayment = await paymentStore.create(pendingPayment);

    // ── Create Stripe Checkout Session ──
    const { sessionId, checkoutUrl } = await stripeCreateCheckoutSession({
      productName: product.title,
      amount,
      currency,
      quantity: parseInt(quantity, 10) || 1,
      customerEmail: customer,
      orderId,
      paymentId: createdPayment.id,
      productSlug: product.slug,
    });

    // ── Update payment with Stripe session ID ──
    await paymentStore.update(createdPayment.id, {
      stripeSessionId: sessionId,
    });

    return successResponse(res, {
      success: true,
      sessionId,
      checkoutUrl,
      orderId,
      paymentId: createdPayment.id,
    }, 'Checkout session created successfully');
  } catch (error) {
    console.error('❌ Error creating checkout session:', error.message);
    next(error);
  }
}

// ─── Stripe Webhook ─────────────────────────────────────────

/**
 * POST /api/payments/webhook
 *
 * Handles Stripe webhook events. Uses raw body for signature verification.
 */
export async function handleStripeWebhook(req, res) {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = constructWebhookEvent(req.rawBody || req.body, signature);
  } catch (err) {
    console.error('⚠️ Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`🔔 Webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'checkout.session.expired':
        await handleCheckoutExpired(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    // Log every webhook event as a transaction record
    await transactionStore.create({
      eventType: event.type,
      stripeEventId: event.id,
      sessionId: event.data.object.id || null,
      paymentIntentId: event.data.object.payment_intent || null,
      status: event.data.object.status || event.data.object.payment_status || null,
      timestamp: new Date().toISOString(),
      metadata: event.data.object.metadata || {},
    });
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
    // Still return 200 to Stripe so it doesn't retry
  }

  // Always acknowledge receipt to Stripe
  return res.status(200).json({ received: true });
}

/**
 * Handle checkout.session.completed — payment succeeded.
 */
async function handleCheckoutCompleted(session) {
  const { orderId, paymentId } = session.metadata || {};

  if (!orderId || !paymentId) {
    console.warn('⚠️ Webhook missing metadata, skipping:', session.id);
    return;
  }

  // ── Update payment ──
  const payment = await paymentStore.findById(paymentId);
  if (!payment) {
    console.warn(`⚠️ Payment ${paymentId} not found for webhook`);
    return;
  }

  // Idempotency: don't process already-completed payments
  if (payment.status === 'completed') {
    console.log(`ℹ️ Payment ${paymentId} already completed, skipping`);
    return;
  }

  await paymentStore.update(paymentId, {
    status: 'completed',
    stripePaymentIntentId: session.payment_intent,
    stripeSessionId: session.id,
    completedAt: new Date().toISOString(),
  });

  // ── Update order ──
  const order = await orderStore.findOne({ orderId });
  if (order && order.status !== 'paid') {
    await orderStore.update(order.id, { status: 'paid' });

    // ── Update analytics ──
    const analytics = await analyticsStore.find({});
    if (analytics && analytics.length > 0) {
      const stats = analytics[0];
      await analyticsStore.update(stats.id, {
        totalOrders: (stats.totalOrders || 0) + 1,
        totalRevenue: (stats.totalRevenue || 0) + (order.amount || 0),
      });
    }
  }

  // ── Create invoice ──
  await invoiceStore.create({
    invoiceId: generateInvoiceId(),
    orderId,
    paymentId,
    amount: payment.amount,
    currency: payment.currency,
    customerEmail: session.customer_email || payment.customer,
    productName: order ? order.product : 'Unknown',
    issuedAt: new Date().toISOString(),
    stripePaymentIntentId: session.payment_intent,
  });

  console.log(`✅ Payment ${paymentId} completed for order ${orderId}`);
}

/**
 * Handle checkout.session.expired — session timed out.
 */
async function handleCheckoutExpired(session) {
  const { orderId, paymentId } = session.metadata || {};
  if (!paymentId) return;

  const payment = await paymentStore.findById(paymentId);
  if (payment && payment.status === 'pending') {
    await paymentStore.update(paymentId, {
      status: 'expired',
      updatedAt: new Date().toISOString(),
    });
  }

  if (orderId) {
    const order = await orderStore.findOne({ orderId });
    if (order && order.status === 'pending') {
      await orderStore.update(order.id, { status: 'failed' });
    }
  }

  console.log(`⏰ Session expired for payment ${paymentId}`);
}

/**
 * Handle payment_intent.payment_failed — card declined, etc.
 */
async function handlePaymentFailed(paymentIntent) {
  // Find payment by Stripe payment intent ID
  const payments = await paymentStore.find({});
  const payment = payments.find(
    (p) => p.stripePaymentIntentId === paymentIntent.id
  );

  if (payment && payment.status === 'pending') {
    await paymentStore.update(payment.id, {
      status: 'failed',
      failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      updatedAt: new Date().toISOString(),
    });

    const order = await orderStore.findOne({ orderId: payment.orderId });
    if (order) {
      await orderStore.update(order.id, { status: 'failed' });
    }
  }

  console.log(`❌ Payment failed for intent ${paymentIntent.id}`);
}

// ─── Verify Session (Frontend Fallback) ─────────────────────

/**
 * POST /api/payments/verify-session
 *
 * Called by frontend after Stripe redirect. Verifies the session
 * directly with Stripe and syncs local records.
 *
 * Body: { sessionId: string }
 */
export async function verifySession(req, res, next) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return errorResponse(res, 'Session ID is required', 400);
    }

    // ── Retrieve session from Stripe ──
    const session = await retrieveSession(sessionId);

    const { orderId, paymentId } = session.metadata || {};

    // ── Sync local records based on Stripe session status ──
    if (session.payment_status === 'paid' && paymentId) {
      const payment = await paymentStore.findById(paymentId);

      // Idempotent: only update if still pending
      if (payment && payment.status === 'pending') {
        await paymentStore.update(paymentId, {
          status: 'completed',
          stripePaymentIntentId: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id || null,
          completedAt: new Date().toISOString(),
        });

        const order = await orderStore.findOne({ orderId });
        if (order && order.status !== 'paid') {
          await orderStore.update(order.id, { status: 'paid' });

          // Update analytics
          const analytics = await analyticsStore.find({});
          if (analytics && analytics.length > 0) {
            const stats = analytics[0];
            await analyticsStore.update(stats.id, {
              totalOrders: (stats.totalOrders || 0) + 1,
              totalRevenue: (stats.totalRevenue || 0) + (order.amount || 0),
            });
          }
        }

        // Create invoice if not already created by webhook
        const existingInvoices = await invoiceStore.find({});
        const invoiceExists = existingInvoices.some((inv) => inv.paymentId === paymentId);
        if (!invoiceExists) {
          await invoiceStore.create({
            invoiceId: generateInvoiceId(),
            orderId,
            paymentId,
            amount: payment.amount,
            currency: payment.currency,
            customerEmail: session.customer_email || payment.customer,
            productName: order ? order.product : 'Unknown',
            issuedAt: new Date().toISOString(),
            stripePaymentIntentId: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
          });
        }

        // Log transaction if not already logged by webhook
        const existingTxns = await transactionStore.find({});
        const txnExists = existingTxns.some(
          (t) => t.sessionId === sessionId && t.eventType === 'session_verified'
        );
        if (!txnExists) {
          await transactionStore.create({
            eventType: 'session_verified',
            sessionId,
            paymentIntentId: typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
            status: 'completed',
            timestamp: new Date().toISOString(),
            metadata: session.metadata || {},
          });
        }
      }
    }

    // ── Build response ──
    const order = orderId ? await orderStore.findOne({ orderId }) : null;
    const payment = paymentId ? await paymentStore.findById(paymentId) : null;

    return successResponse(res, {
      verified: session.payment_status === 'paid',
      paymentStatus: session.payment_status,
      order: order
        ? {
            orderId: order.orderId,
            product: order.product,
            amount: order.amount,
            currency: order.currency,
            status: order.status,
            date: order.date,
          }
        : null,
      payment: payment
        ? {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            completedAt: payment.completedAt,
          }
        : null,
      customerEmail: session.customer_email,
    }, session.payment_status === 'paid' ? 'Payment verified successfully' : 'Payment not yet completed');
  } catch (error) {
    console.error('❌ Session verification error:', error.message);
    next(error);
  }
}

// ─── Refund ─────────────────────────────────────────────────

/**
 * POST /api/payments/refund/:transactionId
 *
 * Initiates a Stripe refund for a completed payment.
 * Admin-only endpoint.
 */
export async function refundPayment(req, res, next) {
  try {
    const { transactionId } = req.params;

    // Find payment by internal ID or legacy transactionId
    let payment = await paymentStore.findById(transactionId);
    if (!payment) {
      payment = await paymentStore.findOne({ transactionId });
    }
    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }

    if (payment.status !== 'completed') {
      return errorResponse(res, 'Only completed payments can be refunded', 400);
    }

    if (!payment.stripePaymentIntentId) {
      return errorResponse(res, 'No Stripe payment intent found for this payment', 400);
    }

    // ── Call Stripe refund API ──
    const stripeRefund = await stripeCreateRefund(payment.stripePaymentIntentId);

    // ── Update payment status ──
    await paymentStore.update(payment.id, {
      status: 'refunded',
      refundedAt: new Date().toISOString(),
    });

    // ── Update order status ──
    const order = await orderStore.findOne({ orderId: payment.orderId });
    if (order) {
      await orderStore.update(order.id, { status: 'refunded' });

      // Deduct from analytics
      const analytics = await analyticsStore.find({});
      if (analytics && analytics.length > 0) {
        const stats = analytics[0];
        await analyticsStore.update(stats.id, {
          totalRevenue: Math.max(0, (stats.totalRevenue || 0) - order.amount),
        });
      }
    }

    // ── Store refund record ──
    await refundStore.create({
      paymentId: payment.id,
      orderId: payment.orderId,
      stripeRefundId: stripeRefund.id,
      stripePaymentIntentId: payment.stripePaymentIntentId,
      amount: payment.amount,
      currency: payment.currency,
      status: stripeRefund.status,
      refundedAt: new Date().toISOString(),
    });

    // ── Log transaction ──
    await transactionStore.create({
      eventType: 'refund_processed',
      sessionId: payment.stripeSessionId,
      paymentIntentId: payment.stripePaymentIntentId,
      stripeRefundId: stripeRefund.id,
      status: 'refunded',
      timestamp: new Date().toISOString(),
      metadata: { orderId: payment.orderId, paymentId: payment.id },
    });

    return successResponse(res, {
      refundId: stripeRefund.id,
      status: stripeRefund.status,
      amount: payment.amount,
      currency: payment.currency,
    }, 'Payment refunded successfully');
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    next(error);
  }
}

// ─── Payment Stats (Admin Dashboard) ────────────────────────

/**
 * GET /api/payments/stats
 *
 * Aggregated payment stats for the admin dashboard.
 */
export async function getPaymentStats(req, res, next) {
  try {
    const payments = await paymentStore.find({});

    const totalPayments = payments.length;
    const successful = payments.filter((p) => p.status === 'completed');
    const failed = payments.filter((p) => p.status === 'failed');
    const refunded = payments.filter((p) => p.status === 'refunded');
    const pending = payments.filter((p) => p.status === 'pending');

    const totalRevenue = successful.reduce((sum, p) => sum + (p.amount || 0), 0);
    const refundedAmount = refunded.reduce((sum, p) => sum + (p.amount || 0), 0);

    // Recent transactions
    const recentPayments = [...payments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return successResponse(res, {
      totalPayments,
      successfulPayments: successful.length,
      failedPayments: failed.length,
      refundedPayments: refunded.length,
      pendingPayments: pending.length,
      totalRevenue,
      refundedAmount,
      netRevenue: totalRevenue - refundedAmount,
      recentPayments,
    }, 'Payment stats retrieved successfully');
  } catch (error) {
    next(error);
  }
}
