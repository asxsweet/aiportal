import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { patchRatingByProject } from '../controllers/rating.controller.js';

const router = Router();

router.patch('/:projectId', authRequired, requireRole('teacher'), patchRatingByProject);

export default router;

