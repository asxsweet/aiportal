import { Router } from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { authRequired, requireRole } from '../middleware/auth.js';

const router = Router();

router.patch('/:projectId', authRequired, requireRole('teacher'), ratingController.patchByProject);

export default router;
