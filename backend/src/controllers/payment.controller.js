import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRazorpayRefund,
} from '../services/razorpayService.js';

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

// ─── Create Razorpay Order ──────────────────────────────────

/**
 * POST /api/payments/create-order
 *
 * Creates a Razorpay Order. Server-side price lookup ensures
 * the frontend can never manipulate the charged amount.
 *
 * Body: { customer: string (email), productSlug: string, quantity?: number }
 */
export async function createOrderHandler(req, res, next) {
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
    const currency = (product.currency || 'USD').toUpperCase();

    // ── Create order ──
    const orderId = generateOrderId();
    const formattedDate = new Date().toISOString().split('T')[0];

    const newOrder = {
      orderId,
      customer,
      product: product.title,
      productSlug: product.slug,
      amount,
      currency,
      gateway: 'razorpay',
      status: 'pending',
      date: formattedDate,
    };
    await orderStore.create(newOrder);

    // ── Create pending payment record ──
    const pendingPayment = {
      orderId,
      customer,
      amount,
      currency,
      gateway: 'razorpay',
      status: 'pending',
      razorpayOrderId: null, // Set after Razorpay call
      razorpayPaymentId: null,
      razorpaySignature: null,
      paymentMethod: 'card',
    };
    const createdPayment = await paymentStore.create(pendingPayment);

    // ── Create Razorpay Order ──
    const rzpOrder = await createRazorpayOrder({
      amount: amount * quantity,
      currency,
      receipt: orderId,
      notes: {
        orderId,
        paymentId: createdPayment.id,
        productSlug: product.slug,
        customer,
      },
    });

    // ── Update payment with Razorpay Order ID ──
    await paymentStore.update(createdPayment.id, {
      razorpayOrderId: rzpOrder.id,
    });

    return successResponse(res, {
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpayOrderId: rzpOrder.id,
      orderId,
      paymentId: createdPayment.id,
      productName: product.title,
      productSlug: product.slug,
      customerEmail: customer,
    }, 'Razorpay order created successfully');
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error.message);
    const statusCode = error.statusCode === 401 ? 400 : (error.statusCode || 500);
    const err = new Error(error.message || 'Error creating Razorpay order');
    err.statusCode = statusCode;
    next(err);
  }
}

// ─── Verify Payment (Signature Verification) ────────────────

/**
 * POST /api/payments/verify-payment
 *
 * Verifies Razorpay payment signature and updates order status.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId }
 */
export async function verifyPaymentHandler(req, res, next) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, paymentId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return errorResponse(res, 'Razorpay order ID, payment ID, and signature are required', 400);
    }

    // ── Verify signature ──
    const isVerified = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isVerified) {
      if (paymentId) {
        await paymentStore.update(paymentId, {
          status: 'failed',
          updatedAt: new Date().toISOString(),
        });
      }
      if (orderId) {
        const order = await orderStore.findOne({ orderId });
        if (order) {
          await orderStore.update(order.id, { status: 'failed' });
        }
      }
      return errorResponse(res, 'Payment signature verification failed', 400);
    }

    // ── Retrieve payment and order ──
    const payment = paymentId ? await paymentStore.findById(paymentId) : null;
    const order = orderId ? await orderStore.findOne({ orderId }) : null;

    if (!payment) {
      return errorResponse(res, 'Payment record not found', 404);
    }

    // Idempotent check
    if (payment.status !== 'completed') {
      // ── Update payment ──
      await paymentStore.update(payment.id, {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        completedAt: new Date().toISOString(),
      });

      // ── Update order ──
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

      // ── Create invoice ──
      const existingInvoices = await invoiceStore.find({});
      const invoiceExists = existingInvoices.some((inv) => inv.paymentId === payment.id);
      if (!invoiceExists) {
        await invoiceStore.create({
          invoiceId: generateInvoiceId(),
          orderId: order ? order.orderId : payment.orderId,
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          customerEmail: payment.customer,
          productName: order ? order.product : 'Unknown',
          issuedAt: new Date().toISOString(),
          razorpayPaymentId: razorpay_payment_id,
        });
      }

      // ── Log transaction ──
      const existingTxns = await transactionStore.find({});
      const txnExists = existingTxns.some(
        (t) => t.razorpayPaymentId === razorpay_payment_id && t.eventType === 'payment_verified'
      );
      if (!txnExists) {
        await transactionStore.create({
          eventType: 'payment_verified',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          status: 'completed',
          timestamp: new Date().toISOString(),
          metadata: { orderId: payment.orderId, paymentId: payment.id },
        });
      }
    }

    const updatedOrder = orderId ? await orderStore.findOne({ orderId }) : null;
    const updatedPayment = await paymentStore.findById(payment.id);

    return successResponse(res, {
      verified: true,
      paymentStatus: 'captured',
      order: updatedOrder
        ? {
            orderId: updatedOrder.orderId,
            product: updatedOrder.product,
            amount: updatedOrder.amount,
            currency: updatedOrder.currency,
            status: updatedOrder.status,
            date: updatedOrder.date,
          }
        : null,
      payment: updatedPayment
        ? {
            id: updatedPayment.id,
            status: updatedPayment.status,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
            completedAt: updatedPayment.completedAt,
          }
        : null,
      customerEmail: payment.customer,
    }, 'Payment verified successfully');
  } catch (error) {
    console.error('❌ Payment verification error:', error.message);
    next(error);
  }
}

// ─── Razorpay Webhook ───────────────────────────────────────

/**
 * POST /api/payments/webhook
 *
 * Handles Razorpay webhook events.
 */
export async function handleRazorpayWebhook(req, res) {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);

  if (!signature) {
    console.error('⚠️ Webhook missing x-razorpay-signature header');
    return res.status(400).json({ error: 'Missing signature' });
  }

  try {
    const isVerified = verifyWebhookSignature(rawBody, signature);
    if (!isVerified) {
      console.error('⚠️ Webhook signature verification failed');
      return res.status(400).json({ error: 'Signature mismatch' });
    }
  } catch (err) {
    console.error('⚠️ Webhook signature verification error:', err.message);
    return res.status(400).json({ error: err.message });
  }

  const event = req.body;
  console.log(`🔔 Webhook received: ${event.event}`);

  try {
    const payload = event.payload;
    
    switch (event.event) {
      case 'order.paid':
      case 'payment.captured': {
        const paymentObj = payload.payment.entity;
        const razorpayOrderId = paymentObj.order_id;
        const razorpayPaymentId = paymentObj.id;
        
        const payments = await paymentStore.find({});
        let payment = payments.find((p) => p.razorpayOrderId === razorpayOrderId);
        
        if (!payment && paymentObj.notes) {
          const { paymentId } = paymentObj.notes;
          if (paymentId) {
            payment = await paymentStore.findById(paymentId);
          }
        }
        
        if (payment) {
          if (payment.status !== 'completed') {
            await paymentStore.update(payment.id, {
              status: 'completed',
              razorpayPaymentId,
              razorpaySignature: signature,
              completedAt: new Date().toISOString(),
            });
            
            const order = await orderStore.findOne({ orderId: payment.orderId });
            if (order && order.status !== 'paid') {
              await orderStore.update(order.id, { status: 'paid' });
              
              const analytics = await analyticsStore.find({});
              if (analytics && analytics.length > 0) {
                const stats = analytics[0];
                await analyticsStore.update(stats.id, {
                  totalOrders: (stats.totalOrders || 0) + 1,
                  totalRevenue: (stats.totalRevenue || 0) + (order.amount || 0),
                });
              }
            }
            
            await invoiceStore.create({
              invoiceId: generateInvoiceId(),
              orderId: payment.orderId,
              paymentId: payment.id,
              amount: payment.amount,
              currency: payment.currency,
              customerEmail: payment.customer,
              productName: order ? order.product : 'Unknown',
              issuedAt: new Date().toISOString(),
              razorpayPaymentId,
            });
          }
        }
        break;
      }
      
      case 'payment.failed': {
        const paymentObj = payload.payment.entity;
        const razorpayOrderId = paymentObj.order_id;
        
        const payments = await paymentStore.find({});
        let payment = payments.find((p) => p.razorpayOrderId === razorpayOrderId);
        
        if (!payment && paymentObj.notes) {
          const { paymentId } = paymentObj.notes;
          if (paymentId) {
            payment = await paymentStore.findById(paymentId);
          }
        }
        
        if (payment && payment.status === 'pending') {
          await paymentStore.update(payment.id, {
            status: 'failed',
            failureReason: paymentObj.error_description || 'Payment failed',
            updatedAt: new Date().toISOString(),
          });
          
          const order = await orderStore.findOne({ orderId: payment.orderId });
          if (order) {
            await orderStore.update(order.id, { status: 'failed' });
          }
        }
        break;
      }
      
      default:
        console.log(`ℹ️ Unhandled Razorpay event: ${event.event}`);
    }

    await transactionStore.create({
      eventType: event.event,
      razorpayEventId: event.id || null,
      razorpayOrderId: event.payload.payment?.entity?.order_id || null,
      razorpayPaymentId: event.payload.payment?.entity?.id || null,
      status: event.payload.payment?.entity?.status || null,
      timestamp: new Date().toISOString(),
      metadata: event.payload.payment?.entity?.notes || {},
    });
    
  } catch (err) {
    console.error('❌ Webhook processing error:', err.message);
  }

  return res.status(200).json({ received: true });
}

// ─── Get Payment Status ─────────────────────────────────────

/**
 * GET /api/payments/status/:paymentId
 *
 * Returns payment status for a payment ID.
 */
export async function getPaymentStatusHandler(req, res, next) {
  try {
    const { paymentId } = req.params;
    
    const payment = await paymentStore.findById(paymentId);
    if (!payment) {
      return errorResponse(res, 'Payment not found', 404);
    }
    
    const order = await orderStore.findOne({ orderId: payment.orderId });
    
    return successResponse(res, {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      currency: payment.currency,
      completedAt: payment.completedAt,
      order: order ? {
        orderId: order.orderId,
        product: order.product,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
      } : null
    }, 'Payment status retrieved successfully');
  } catch (error) {
    next(error);
  }
}

// ─── Refund ─────────────────────────────────────────────────

/**
 * POST /api/payments/refund/:transactionId
 *
 * Initiates a Razorpay refund for a completed payment.
 * Admin-only endpoint.
 */
export async function refundPayment(req, res, next) {
  try {
    const { transactionId } = req.params;

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

    if (!payment.razorpayPaymentId) {
      return errorResponse(res, 'No Razorpay payment ID found for this payment', 400);
    }

    // ── Call Razorpay refund API ──
    const razorpayRefund = await createRazorpayRefund(payment.razorpayPaymentId);

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
      razorpayRefundId: razorpayRefund.id,
      razorpayPaymentId: payment.razorpayPaymentId,
      amount: payment.amount,
      currency: payment.currency,
      status: razorpayRefund.status,
      refundedAt: new Date().toISOString(),
    });

    // ── Log transaction ──
    await transactionStore.create({
      eventType: 'refund_processed',
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      razorpayRefundId: razorpayRefund.id,
      status: 'refunded',
      timestamp: new Date().toISOString(),
      metadata: { orderId: payment.orderId, paymentId: payment.id },
    });

    return successResponse(res, {
      refundId: razorpayRefund.id,
      status: razorpayRefund.status,
      amount: payment.amount,
      currency: payment.currency,
    }, 'Payment refunded successfully');
  } catch (error) {
    console.error('❌ Refund error:', error.message);
    const statusCode = error.statusCode === 401 ? 400 : (error.statusCode || 500);
    const err = new Error(error.message || 'Refund processing failed');
    err.statusCode = statusCode;
    next(err);
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
