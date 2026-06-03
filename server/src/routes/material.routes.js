import { Router } from 'express';
import * as materialController from '../controllers/material.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { materialUpload } from '../middleware/upload.js';

const router = Router();

router.get('/', authRequired, materialController.listMaterials);
router.get('/category/:category', authRequired, materialController.getMaterialsByCategory);
router.get('/:id/download', authRequired, materialController.downloadMaterial);
router.post(
  '/',
  authRequired,
  requireRole('teacher'),
  materialUpload.single('file'),
  materialController.createMaterial,
);
router.delete('/:id', authRequired, requireRole('teacher'), materialController.deleteMaterial);

export default router;