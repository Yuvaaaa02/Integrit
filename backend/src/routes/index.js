import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import serviceRoutes from './service.routes.js';
import blogRoutes from './blog.routes.js';
import testimonialRoutes from './testimonial.routes.js';
import orderRoutes from './order.routes.js';
import paymentRoutes from './payment.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import adminRoutes from './admin.routes.js';
import faqRoutes from './faq.routes.js';
import settingRoutes from './setting.routes.js';
import uploadRoutes from './upload.routes.js';
import prereleaseRoutes from './prerelease.routes.js';

const router = Router();

// Mount all routes under their respective sub-paths
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/services', serviceRoutes);
router.use('/blog', blogRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin', adminRoutes);
router.use('/faqs', faqRoutes);
router.use('/settings', settingRoutes);
router.use('/uploads', uploadRoutes);
router.use('/prerelease', prereleaseRoutes);

export default router;
