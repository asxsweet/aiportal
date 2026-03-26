import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { getAnalyticsSummary } from '../controllers/analytics.controller.js';

const router = Router();

router.get('/summary', authRequired, requireRole('teacher'), getAnalyticsSummary);

export default router;

