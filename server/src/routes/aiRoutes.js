import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

router.post('/assist', authRequired, aiController.assist);
router.post('/evaluate', authRequired, aiController.evaluate);

export default router;
