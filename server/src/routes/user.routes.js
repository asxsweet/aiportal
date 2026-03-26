import { Router } from 'express';
import { authRequired } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { avatarUpload } from '../middleware/upload.js';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/me', authRequired, userController.getProfile);
router.put('/update', authRequired, userController.updateProfile);
router.put('/password', authRequired, userController.updatePassword);
router.post('/avatar', authRequired, avatarUpload.single('file'), userController.uploadAvatar);
router.post('/logout-all', authRequired, userController.logoutAllDevices);
router.delete('/me', authRequired, userController.deleteAccount);
router.get('/students', authRequired, requireRole('teacher'), userController.listStudents);

export default router;

