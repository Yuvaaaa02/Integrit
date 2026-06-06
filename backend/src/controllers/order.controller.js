import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const orderStore = new JsonStore('orders.json');
const analyticsStore = new JsonStore('analytics.json');

// Generate unique order ID
function generateOrderId() {
  return 'ord_' + Math.floor(1000 + Math.random() * 9000);
}

export async function getAllOrders(req, res, next) {
  try {
    const { status, limit, page } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const orders = await orderStore.find(filter);

    // Sort by date descending
    orders.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const total = orders.length;
    const paginatedOrders = orders.slice(startIndex, startIndex + limitNum);

    return successResponse(res, {
      orders: paginatedOrders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    // Check by id or orderId
    let order = await orderStore.findOne({ id });
    if (!order) {
      order = await orderStore.findOne({ orderId: id });
    }

    if (!order) {
      return errorResponse(res, `Order '${id}' not found`, 404);
    }

    return successResponse(res, order, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createOrder(req, res, next) {
  try {
    const { customer, product, productSlug, amount, currency, gateway, status } = req.body;

    const orderId = generateOrderId();
    const formattedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const newOrder = {
      orderId,
      customer,
      product,
      productSlug,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      gateway: gateway || 'razorpay',
      status: status || 'pending',
      date: formattedDate
    };

    const created = await orderStore.create(newOrder);

    // Update analytics totalOrders and revenue if paid immediately
    if (newOrder.status === 'paid') {
      const analytics = await analyticsStore.find({});
      if (analytics && analytics.length > 0) {
        const stats = analytics[0];
        await analyticsStore.update(stats.id, {
          totalOrders: (stats.totalOrders || 0) + 1,
          totalRevenue: (stats.totalRevenue || 0) + newOrder.amount
        });
      }
    }

    return successResponse(res, created, 'Order created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'failed', 'refunded'].includes(status)) {
      return errorResponse(res, 'Invalid order status', 400);
    }

    let order = await orderStore.findOne({ id });
    if (!order) {
      order = await orderStore.findOne({ orderId: id });
    }

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const previousStatus = order.status;
    const updated = await orderStore.update(order.id, { status });

    // Update analytics if order transition to/from 'paid'
    if (previousStatus !== 'paid' && status === 'paid') {
      const analytics = await analyticsStore.find({});
      if (analytics && analytics.length > 0) {
        const stats = analytics[0];
        await analyticsStore.update(stats.id, {
          totalOrders: (stats.totalOrders || 0) + 1,
          totalRevenue: (stats.totalRevenue || 0) + order.amount
        });
      }
    } else if (previousStatus === 'paid' && status !== 'paid') {
      const analytics = await analyticsStore.find({});
      if (analytics && analytics.length > 0) {
        const stats = analytics[0];
        await analyticsStore.update(stats.id, {
          totalOrders: Math.max(0, (stats.totalOrders || 0) - 1),
          totalRevenue: Math.max(0, (stats.totalRevenue || 0) - order.amount)
        });
      }
    }

    return successResponse(res, updated, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    let order = await orderStore.findOne({ id });
    if (!order) {
      order = await orderStore.findOne({ orderId: id });
    }

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Convert amount to numeric if passed
    if (updateData.amount !== undefined) {
      updateData.amount = parseFloat(updateData.amount);
    }

    const updated = await orderStore.update(order.id, updateData);
    return successResponse(res, updated, 'Order updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const { id } = req.params;

    let order = await orderStore.findOne({ id });
    if (!order) {
      order = await orderStore.findOne({ orderId: id });
    }

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    await orderStore.delete(order.id);
    return successResponse(res, null, 'Order deleted successfully');
  } catch (error) {
    next(error);
  }
}
