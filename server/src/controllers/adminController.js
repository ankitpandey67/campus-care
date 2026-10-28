import Department from '../models/Department.js';
import Category from '../models/Category.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Complaint from '../models/Complaint.js';

export const getDepartments = async (req, res) => {
  const departments = await Department.find().populate('head', 'name email');
  res.json({ success: true, data: departments });
};

export const createDepartment = async (req, res) => {
  const dept = await Department.create(req.body);
  res.status(201).json({ success: true, data: dept });
};

export const updateDepartment = async (req, res) => {
  const dept = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: dept });
};

export const deleteDepartment = async (req, res) => {
  await Department.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Department deleted' });
};

export const getCategories = async (req, res) => {
  const categories = await Category.find().populate('defaultDepartment', 'name');
  res.json({ success: true, data: categories });
};

export const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
};

export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: category });
};

export const getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
};

export const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  res.json({ success: true, data: user });
};

export const updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json({ success: true, data: user });
};

export const updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json({ success: true, data: user });
};

export const updateUserStatus = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { accountStatus: req.body.accountStatus }, { new: true }).select('-password');
  res.json({ success: true, data: user });
};

export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
};

export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  res.json({ success: true, data: notification });
};

export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id }, { read: true });
  res.json({ success: true, message: 'All notifications marked read' });
};

export const getDashboardAnalytics = async (req, res) => {
  const complaintCount = await Complaint.countDocuments();
  const open = await Complaint.countDocuments({ status: { $nin: ['Resolved', 'Closed', 'Rejected'] } });
  const resolved = await Complaint.countDocuments({ status: 'Resolved' });
  const critical = await Complaint.countDocuments({ priority: 'Critical' });

  res.json({
    success: true,
    data: {
      totalComplaints: complaintCount,
      openComplaints: open,
      resolvedComplaints: resolved,
      criticalComplaints: critical,
    },
  });
};
