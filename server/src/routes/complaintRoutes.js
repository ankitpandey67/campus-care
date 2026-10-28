import express from 'express';
import { body } from 'express-validator';
import {
  addAttachment,
  addComment,
  addFeedback,
  createComplaint,
  getAvailableCategories,
  getComplaintAnalytics,
  getComplaintById,
  getComplaintHistory,
  getComplaints,
  reopenComplaint,
  updateComplaint,
  updateComplaintStatus,
  assignComplaint,
} from '../controllers/complaintController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();

router.use(protect);
router.get('/categories', getAvailableCategories);
router.get('/', getComplaints);
router.post('/', upload.array('attachments', 5), createComplaint);
router.get('/analytics', getComplaintAnalytics);
router.get('/:id', getComplaintById);
router.patch('/:id', updateComplaint);
router.patch('/:id/status', [body('status').notEmpty()], updateComplaintStatus);
router.patch('/:id/assign', [body('assignee').optional()], assignComplaint);
router.post('/:id/comments', [body('message').notEmpty()], addComment);
router.post('/:id/attachments', upload.array('attachments', 5), addAttachment);
router.post('/:id/feedback', addFeedback);
router.post('/:id/reopen', [body('reason').optional()], reopenComplaint);
router.get('/:id/history', getComplaintHistory);

export default router;
