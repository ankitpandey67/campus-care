import express from 'express';
import {
  createCategory,
  createDepartment,
  deleteDepartment,
  getCategories,
  getDepartments,
  getNotifications,
  getUserById,
  getUsers,
  markAllNotificationsRead,
  markNotificationRead,
  updateCategory,
  updateDepartment,
  updateUser,
  updateUserRole,
  updateUserStatus,
  getDashboardAnalytics,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboardAnalytics);
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.patch('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id', updateUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.patch('/notifications/read-all', markAllNotificationsRead);

export default router;
