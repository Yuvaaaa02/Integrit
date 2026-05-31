import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const testimonialStore = new JsonStore('testimonials.json');

export async function getAllTestimonials(req, res, next) {
  try {
    const testimonials = await testimonialStore.find({});
    return successResponse(res, testimonials, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createTestimonial(req, res, next) {
  try {
    const data = req.body;
    const newTestimonial = {
      ...data,
      rating: parseInt(data.rating, 10) || 5,
    };

    const created = await testimonialStore.create(newTestimonial);
    return successResponse(res, created, 'Testimonial created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;

    const existing = await testimonialStore.findById(id);
    if (!existing) {
      return errorResponse(res, 'Testimonial not found', 404);
    }

    const updated = await testimonialStore.update(id, data);
    return successResponse(res, updated, 'Testimonial updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteTestimonial(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await testimonialStore.findById(id);
    if (!existing) {
      return errorResponse(res, 'Testimonial not found', 404);
    }

    await testimonialStore.delete(id);
    return successResponse(res, null, 'Testimonial deleted successfully');
  } catch (error) {
    next(error);
  }
}
