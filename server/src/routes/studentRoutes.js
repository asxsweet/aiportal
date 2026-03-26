import { Router } from 'express';
import * as studentController from '../controllers/studentController.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authRequired, requireRole('student'), studentController.dashboard);

export default router;
