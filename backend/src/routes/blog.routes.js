import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../controllers/blog.controller.js';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';

const router = Router();

const blogValidationRules = [
  body('title').notEmpty().withMessage('Blog title is required').trim(),
  body('excerpt').notEmpty().withMessage('Blog excerpt is required').trim(),
  body('content').notEmpty().withMessage('Blog content is required').trim(),
  validate
];

router.get('/', optionalAuthMiddleware, getAllBlogPosts);
router.get('/:slug', optionalAuthMiddleware, getBlogPostBySlug);

router.post('/', authMiddleware, adminMiddleware, blogValidationRules, createBlogPost);
router.put('/:slug', authMiddleware, adminMiddleware, blogValidationRules, updateBlogPost);
router.delete('/:slug', authMiddleware, adminMiddleware, deleteBlogPost);

export default router;
