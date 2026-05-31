import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const productStore = new JsonStore('products.json');

// Helper to generate a URL-friendly slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

export async function getAllProducts(req, res, next) {
  try {
    const { category, search, tag, status, limit, page } = req.query;

    let filter = {};

    // For public routes, only return published products
    // (If not logged in as admin, or explicitly requested public view)
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    let products = await productStore.find(filter);

    // Filter by tag
    if (tag) {
      products = products.filter(p => p.tags && p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
    }

    // Search query
    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p => 
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(q))
      );
    }

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const total = products.length;
    const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

    return successResponse(res, {
      products: paginatedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Products retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const product = await productStore.findOne({ slug });

    if (!product) {
      return errorResponse(res, `Product with slug '${slug}' not found`, 404);
    }

    // Public users can't view draft products
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && product.status !== 'published') {
      return errorResponse(res, `Product not available`, 403);
    }

    return successResponse(res, product, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createProduct(req, res, next) {
  try {
    const productData = req.body;
    
    // Generate slug from title if not provided
    if (!productData.slug) {
      productData.slug = slugify(productData.title);
    }

    // Check if slug exists
    const existing = await productStore.findOne({ slug: productData.slug });
    if (existing) {
      return errorResponse(res, `Product with slug/title '${productData.slug}' already exists`, 400);
    }

    // Set default values
    const newProduct = {
      ...productData,
      rating: parseFloat(productData.rating) || 5.0,
      reviewCount: parseInt(productData.reviewCount, 10) || 0,
      currency: productData.currency || 'USD',
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      features: Array.isArray(productData.features) ? productData.features : [],
      techStack: Array.isArray(productData.techStack) ? productData.techStack : [],
      workflowSteps: Array.isArray(productData.workflowSteps) ? productData.workflowSteps : [],
      faqs: Array.isArray(productData.faqs) ? productData.faqs : [],
      status: productData.status || 'published', // default to published
    };

    const created = await productStore.create(newProduct);
    return successResponse(res, created, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const existing = await productStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Product with slug '${slug}' not found`, 404);
    }

    // Generate new slug if title changed and slug not frozen
    if (updateData.title && updateData.title !== existing.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const updated = await productStore.update(existing.id, updateData);
    return successResponse(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { slug } = req.params;
    const existing = await productStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Product with slug '${slug}' not found`, 404);
    }

    await productStore.delete(existing.id);
    return successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
}
