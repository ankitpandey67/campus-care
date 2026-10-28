import express from 'express';
import { dashboardMetrics, complaintsTrend, departmentOverview, userOverview } from '../controllers/analyticsController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', dashboardMetrics);
router.get('/complaints', complaintsTrend);
router.get('/departments', departmentOverview);
router.get('/users', userOverview);

export default router;
