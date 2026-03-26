import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { projectUpload } from '../middleware/upload.js';

const router = Router();

router.get('/:id/file', authRequired, projectController.downloadFile);
router.get('/', authRequired, projectController.list);
router.get('/:id', authRequired, projectController.getById);
router.post(
  '/',
  authRequired,
  requireRole('student'),
  projectUpload.single('file'),
  projectController.create,
);

export default router;
