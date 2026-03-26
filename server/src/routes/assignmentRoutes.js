import { Router } from 'express';
import * as assignmentController from '../controllers/assignmentController.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { assignmentUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', authRequired, assignmentController.list);
router.get('/:id/attachment', authRequired, assignmentController.downloadAttachment);
router.get('/:id', authRequired, assignmentController.getById);
router.post(
  '/',
  authRequired,
  requireRole('teacher'),
  assignmentUpload.single('file'),
  assignmentController.create,
);
router.patch('/:id', authRequired, requireRole('teacher'), assignmentController.update);
router.delete('/:id', authRequired, requireRole('teacher'), assignmentController.remove);

export default router;
