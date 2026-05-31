import { Router } from 'express';
import { getDashboardStats, getSystemLogs } from '../controllers/admin.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = Router();

router.get('/dashboard', authMiddleware, adminMiddleware, getDashboardStats);
router.get('/logs', authMiddleware, adminMiddleware, getSystemLogs);

export default router;
