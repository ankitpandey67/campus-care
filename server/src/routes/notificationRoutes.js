import express from 'express';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/:id/read', markNotificationRead);
router.patch('/read-all', markAllNotificationsRead);

export default router;
