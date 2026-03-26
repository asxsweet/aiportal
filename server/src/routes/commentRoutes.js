import { Router } from 'express';
import * as commentController from '../controllers/commentController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, commentController.list);
router.post('/', authRequired, commentController.create);
router.delete('/:id', authRequired, commentController.remove);

export default router;
