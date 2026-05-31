import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const serviceStore = new JsonStore('services.json');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function getAllServices(req, res, next) {
  try {
    const services = await serviceStore.find({});
    return successResponse(res, services, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getServiceBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const service = await serviceStore.findOne({ slug });

    if (!service) {
      return errorResponse(res, `Service with slug '${slug}' not found`, 404);
    }

    return successResponse(res, service, 'Service retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createService(req, res, next) {
  try {
    const serviceData = req.body;

    if (!serviceData.slug) {
      serviceData.slug = slugify(serviceData.title);
    }

    const existing = await serviceStore.findOne({ slug: serviceData.slug });
    if (existing) {
      return errorResponse(res, `Service with slug/title '${serviceData.slug}' already exists`, 400);
    }

    const newService = {
      ...serviceData,
      packages: Array.isArray(serviceData.packages) ? serviceData.packages : [],
    };

    const created = await serviceStore.create(newService);
    return successResponse(res, created, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req, res, next) {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const existing = await serviceStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Service with slug '${slug}' not found`, 404);
    }

    if (updateData.title && updateData.title !== existing.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const updated = await serviceStore.update(existing.id, updateData);
    return successResponse(res, updated, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteService(req, res, next) {
  try {
    const { slug } = req.params;
    const existing = await serviceStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Service with slug '${slug}' not found`, 404);
    }

    await serviceStore.delete(existing.id);
    return successResponse(res, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
}
