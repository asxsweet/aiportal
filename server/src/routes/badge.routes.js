import { Router } from 'express';
import * as badgeController from '../controllers/badge.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/mine', authRequired, badgeController.getMyBadges);
router.get('/types', authRequired, badgeController.getAllBadgeTypes);

export default router;