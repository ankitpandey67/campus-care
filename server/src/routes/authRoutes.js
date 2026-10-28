import express from 'express';
import { body, validationResult } from 'express-validator';
import { forgotPassword, getMe, loginUser, logoutUser, registerUser, resetPassword } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'staff']).withMessage('Choose a valid account type'),
], validateRequest, registerUser);

router.post('/login', [
  body('email').trim().isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
], validateRequest, loginUser);

router.post('/logout', protect, logoutUser);
router.get('/me', protect, getMe);
router.post('/forgot-password', [body('email').trim().isEmail()], validateRequest, forgotPassword);
router.post('/reset-password', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 }),
], validateRequest, resetPassword);

export default router;
