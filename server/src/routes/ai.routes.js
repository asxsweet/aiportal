import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.post('/assist', authRequired, aiController.assist);
router.post('/evaluate', authRequired, aiController.evaluate);

export default router;

