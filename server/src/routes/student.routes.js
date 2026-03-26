import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { getStudentDashboard } from '../controllers/student.controller.js';

const router = Router();

router.get('/dashboard', authRequired, requireRole('student'), getStudentDashboard);

export default router;

