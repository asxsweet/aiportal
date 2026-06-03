import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authRequired, notificationController.getMyNotifications);
router.get('/unread-count', authRequired, notificationController.getUnreadCount);
router.post('/read-all', authRequired, notificationController.markAllAsRead);
router.post('/:id/read', authRequired, notificationController.markAsRead);

export default router;