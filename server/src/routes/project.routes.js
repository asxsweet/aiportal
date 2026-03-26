import { Router } from 'express';
import * as projectController from '../controllers/project.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { projectUpload } from '../middleware/upload.js';

const router = Router();

router.get('/:id/file', authRequired, projectController.downloadProjectFile);
router.get('/', authRequired, projectController.listProjects);
router.get('/:id', authRequired, projectController.getProjectById);
router.post(
  '/',
  authRequired,
  requireRole('student'),
  projectUpload.single('file'),
  projectController.createProject,
);

export default router;

