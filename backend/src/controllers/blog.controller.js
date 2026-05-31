import { JsonStore } from '../utils/JsonStore.js';
import { successResponse, errorResponse } from '../utils/response.js';

const blogStore = new JsonStore('blog-posts.json');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function getAllBlogPosts(req, res, next) {
  try {
    const { tag, search, status, page, limit } = req.query;

    let filter = {};
    const isAdmin = req.user && req.user.role === 'admin';

    if (!isAdmin) {
      filter.status = 'published';
    } else if (status) {
      filter.status = status;
    }

    let posts = await blogStore.find(filter);

    if (tag) {
      posts = posts.filter(post => post.tags && post.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
    }

    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(post =>
        (post.title && post.title.toLowerCase().includes(q)) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(q)) ||
        (post.content && post.content.toLowerCase().includes(q))
      );
    }

    // Sort by date desc (or default order)
    posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    // Pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const total = posts.length;
    const paginatedPosts = posts.slice(startIndex, startIndex + limitNum);

    return successResponse(res, {
      posts: paginatedPosts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Blog posts retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getBlogPostBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const post = await blogStore.findOne({ slug });

    if (!post) {
      return errorResponse(res, `Blog post with slug '${slug}' not found`, 404);
    }

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && post.status !== 'published') {
      return errorResponse(res, `Blog post not available`, 403);
    }

    return successResponse(res, post, 'Blog post retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createBlogPost(req, res, next) {
  try {
    const postData = req.body;

    if (!postData.slug) {
      postData.slug = slugify(postData.title);
    }

    const existing = await blogStore.findOne({ slug: postData.slug });
    if (existing) {
      return errorResponse(res, `Blog post with slug/title '${postData.slug}' already exists`, 400);
    }

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const newPost = {
      ...postData,
      date: postData.date || formattedDate,
      author: postData.author || 'Integrit Team',
      tags: Array.isArray(postData.tags) ? postData.tags : [],
      status: postData.status || 'published',
      readTime: postData.readTime || '5 min',
    };

    const created = await blogStore.create(newPost);
    return successResponse(res, created, 'Blog post created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateBlogPost(req, res, next) {
  try {
    const { slug } = req.params;
    const updateData = req.body;

    const existing = await blogStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Blog post with slug '${slug}' not found`, 404);
    }

    if (updateData.title && updateData.title !== existing.title && !updateData.slug) {
      updateData.slug = slugify(updateData.title);
    }

    const updated = await blogStore.update(existing.id, updateData);
    return successResponse(res, updated, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteBlogPost(req, res, next) {
  try {
    const { slug } = req.params;
    const existing = await blogStore.findOne({ slug });
    if (!existing) {
      return errorResponse(res, `Blog post with slug '${slug}' not found`, 404);
    }

    await blogStore.delete(existing.id);
    return successResponse(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
}
