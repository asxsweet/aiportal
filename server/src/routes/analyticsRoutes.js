import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/summary', authRequired, requireRole('teacher'), analyticsController.summary);

export default router;
