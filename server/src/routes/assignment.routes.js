import { Router } from 'express';
import * as assignmentController from '../controllers/assignment.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { assignmentUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', authRequired, assignmentController.listAssignments);
router.get('/:id/attachment', authRequired, assignmentController.downloadAttachment);
router.get('/:id', authRequired, assignmentController.getAssignmentById);
router.post(
  '/',
  authRequired,
  requireRole('teacher'),
  assignmentUpload.single('file'),
  assignmentController.createAssignment,
);
router.patch('/:id', authRequired, requireRole('teacher'), assignmentController.updateAssignment);
router.patch('/:id/archive', authRequired, requireRole('teacher'), assignmentController.archiveAssignment);
router.patch('/:id/restore', authRequired, requireRole('teacher'), assignmentController.restoreAssignment);
router.delete('/:id', authRequired, requireRole('teacher'), assignmentController.deleteAssignment);

export default router;

