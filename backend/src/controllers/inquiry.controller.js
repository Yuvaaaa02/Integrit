import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const inquiryStore = new JsonStore('inquiries.json');
const analyticsStore = new JsonStore('analytics.json');

export async function getAllInquiries(req, res, next) {
  try {
    const { read, page, limit } = req.query;

    let filter = {};
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const inquiries = await inquiryStore.find(filter);

    // Sort by date descending
    inquiries.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const total = inquiries.length;
    const paginated = inquiries.slice(startIndex, startIndex + limitNum);

    return successResponse(res, {
      inquiries: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Inquiries retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createInquiry(req, res, next) {
  try {
    const { name, email, phone, type, message } = req.body;

    const formattedDate = new Date().toISOString().split('T')[0];

    const newInquiry = {
      name,
      email,
      phone: phone || '',
      type: type || 'inquiry', // consultation or inquiry
      message,
      date: formattedDate,
      read: false
    };

    const created = await inquiryStore.create(newInquiry);

    // Update analytics totalInquiries counter
    const analytics = await analyticsStore.find({});
    if (analytics && analytics.length > 0) {
      const stats = analytics[0];
      await analyticsStore.update(stats.id, {
        totalInquiries: (stats.totalInquiries || 0) + 1
      });
    }

    return successResponse(res, created, 'Your inquiry has been submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const { id } = req.params;
    const { read } = req.body; // true or false

    const existing = await inquiryStore.findById(id);
    if (!existing) {
      return errorResponse(res, 'Inquiry not found', 404);
    }

    const updated = await inquiryStore.update(id, { read: read === true });
    return successResponse(res, updated, `Inquiry marked as ${read ? 'read' : 'unread'}`);
  } catch (error) {
    next(error);
  }
}

export async function deleteInquiry(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await inquiryStore.findById(id);
    if (!existing) {
      return errorResponse(res, 'Inquiry not found', 404);
    }

    await inquiryStore.delete(id);

    // Update analytics totalInquiries counter (decrement)
    const analytics = await analyticsStore.find({});
    if (analytics && analytics.length > 0) {
      const stats = analytics[0];
      await analyticsStore.update(stats.id, {
        totalInquiries: Math.max(0, (stats.totalInquiries || 0) - 1)
      });
    }

    return successResponse(res, null, 'Inquiry deleted successfully');
  } catch (error) {
    next(error);
  }
}
