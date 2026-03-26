import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { authRequired, requireRole } from '../middleware/auth.js';
import { avatarUpload } from '../middleware/upload.js';

const router = Router();

router.get('/me', authRequired, userController.getProfile);
router.put('/update', authRequired, userController.updateProfile);
router.put('/password', authRequired, userController.updatePassword);
router.post('/avatar', authRequired, avatarUpload.single('file'), userController.uploadAvatar);
router.post('/logout-all', authRequired, userController.logoutAllDevices);
router.delete('/me', authRequired, userController.deleteAccount);

router.get('/students', authRequired, requireRole('teacher'), userController.listStudents);

export default router;
