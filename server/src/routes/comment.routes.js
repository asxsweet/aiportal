import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { createComment, deleteComment, listComments } from '../controllers/comment.controller.js';

const router = Router();

router.get('/', authRequired, listComments);
router.post('/', authRequired, createComment);
router.delete('/:id', authRequired, deleteComment);

export default router;

