import fs from 'fs';
import path from 'path';
import Complaint from '../models/Complaint.js';
import ComplaintHistory from '../models/ComplaintHistory.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Category from '../models/Category.js';
import Comment from '../models/Comment.js';
import { isValidStatusTransition } from '../utils/statusRules.js';

const getPagination = (page = 1, limit = 10) => {
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;
  return { page: safePage, limit: safeLimit };
};

const buildComplaintFilter = (user, query = {}) => {
  const filter = {};
  const staffAccessFilter =
    user.role === 'staff'
      ? { $or: [{ assignee: user._id }, { department: user.department }] }
      : null;

  if (user.role === 'student') {
    filter.complainant = user._id;
  }

  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.department) filter.department = query.department;
  if (query.search) {
    const searchText = String(query.search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchFilter = {
      $or: [
        { title: { $regex: searchText, $options: 'i' } },
        { ticketNumber: { $regex: searchText, $options: 'i' } },
        { location: { $regex: searchText, $options: 'i' } },
      ],
    };
    if (staffAccessFilter) {
      filter.$and = [staffAccessFilter, searchFilter];
    } else {
      Object.assign(filter, searchFilter);
    }
  } else if (staffAccessFilter) {
    Object.assign(filter, staffAccessFilter);
  }

  return filter;
};

export const getAvailableCategories = async (req, res) => {
  const categories = await Category.find({ active: true })
    .populate('defaultDepartment', 'name')
    .sort({ name: 1 });

  res.json({ success: true, data: categories });
};

export const getComplaints = async (req, res) => {
  const { page, limit } = getPagination(req.query.page, req.query.limit);
  const filter = buildComplaintFilter(req.user, req.query);

  const total = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .populate('complainant', 'name email role')
    .populate('department', 'name')
    .populate('assignee', 'name email')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: complaints,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

export const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('complainant', 'name email role')
    .populate('assignee', 'name email')
    .populate('department', 'name')
    .populate('category', 'name');

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const allowed =
    req.user.role === 'admin' ||
    complaint.complainant.toString() === req.user._id.toString() ||
    complaint.assignee?.toString() === req.user._id.toString() ||
    complaint.department?.toString() === req.user.department?.toString();

  if (!allowed) {
    return res.status(403).json({ success: false, message: 'Not allowed to access this complaint' });
  }

  const comments = await Comment.find({ complaint: complaint._id }).populate('author', 'name email');
  const histories = await ComplaintHistory.find({ complaint: complaint._id }).populate('actor', 'name');

  res.json({ success: true, data: { ...complaint.toObject(), comments, histories } });
};

export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, department, priority = 'Medium' } = req.body;

    const categoryDoc = await Category.findOne({ _id: category, active: true });
    const departmentDoc = department ? await Department.findById(department) : null;

    if (!categoryDoc) {
      return res.status(400).json({ success: false, message: 'Category not found or inactive' });
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: categoryDoc._id,
      location,
      complainant: req.user._id,
      department: departmentDoc?._id || categoryDoc.defaultDepartment,
      priority,
      attachments: (req.files || []).map((file) => file.filename),
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Complaint submitted',
      message: `Your complaint ${complaint.ticketNumber} has been received and is being reviewed.`,
      relatedComplaint: complaint._id,
    });

    await ComplaintHistory.create({
      complaint: complaint._id,
      action: 'Created',
      previousValue: 'None',
      newValue: 'Submitted',
      actor: req.user._id,
      notes: 'Complaint created',
    });

    res.status(201).json({ success: true, data: complaint, notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const allowed = req.user.role === 'admin' || complaint.complainant.toString() === req.user._id.toString();
  if (!allowed) {
    return res.status(403).json({ success: false, message: 'Not allowed to update this complaint' });
  }

  Object.assign(complaint, req.body);
  complaint.lastUpdated = new Date();
  await complaint.save();

  res.json({ success: true, data: complaint });
};

export const updateComplaintStatus = async (req, res) => {
  const { status, reason } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const previous = complaint.status;
  if (!isValidStatusTransition(previous, status)) {
    return res.status(400).json({ success: false, message: `Invalid status transition from ${previous} to ${status}` });
  }

  complaint.status = status;
  complaint.lastUpdated = new Date();
  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'StatusChanged',
    previousValue: previous,
    newValue: status,
    actor: req.user._id,
    notes: reason || '',
  });

  const user = await User.findById(complaint.complainant);
  await Notification.create({
    recipient: complaint.complainant,
    title: 'Complaint status updated',
    message: `Complaint ${complaint.ticketNumber} moved to ${status}.`,
    relatedComplaint: complaint._id,
  });

  if (user) {
    await Notification.create({
      recipient: complaint.assignee || complaint.department,
      title: 'Status change noted',
      message: `Complaint ${complaint.ticketNumber} has been updated to ${status}.`,
      relatedComplaint: complaint._id,
    });
  }

  res.json({ success: true, data: complaint });
};

export const assignComplaint = async (req, res) => {
  const { assignee, department } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Only admin can assign complaints' });
  }

  complaint.assignee = assignee || null;
  complaint.department = department || complaint.department;
  complaint.status = complaint.assignee ? 'Assigned' : complaint.status;
  complaint.lastUpdated = new Date();
  await complaint.save();

  if (assignee) {
    await Notification.create({
      recipient: assignee,
      title: 'Complaint assigned',
      message: `You have been assigned complaint ${complaint.ticketNumber}.`,
      relatedComplaint: complaint._id,
    });
  }

  res.json({ success: true, data: complaint });
};

export const addComment = async (req, res) => {
  const { message, visibility = 'public' } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const comment = await Comment.create({
    complaint: complaint._id,
    author: req.user._id,
    message,
    visibility,
  });

  res.status(201).json({ success: true, data: comment });
};

export const addAttachment = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  const filenames = (req.files || []).map((file) => file.filename);
  complaint.attachments = [...complaint.attachments, ...filenames];
  complaint.lastUpdated = new Date();
  await complaint.save();

  res.status(201).json({ success: true, data: complaint.attachments });
};

export const addFeedback = async (req, res) => {
  const { rating, feedback } = req.body;
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.rating = rating;
  complaint.feedback = feedback;
  await complaint.save();

  res.json({ success: true, data: complaint });
};

export const reopenComplaint = async (req, res) => {
  const { reason } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ success: false, message: 'Complaint not found' });
  }

  complaint.status = 'Reopened';
  complaint.lastUpdated = new Date();
  await complaint.save();

  await ComplaintHistory.create({
    complaint: complaint._id,
    action: 'Reopened',
    previousValue: 'Closed',
    newValue: 'Reopened',
    actor: req.user._id,
    notes: reason || 'Complaint reopened',
  });

  res.json({ success: true, data: complaint });
};

export const getComplaintHistory = async (req, res) => {
  const entries = await ComplaintHistory.find({ complaint: req.params.id }).populate('actor', 'name');
  res.json({ success: true, data: entries });
};

export const getComplaintAnalytics = async (req, res) => {
  const total = await Complaint.countDocuments();
  const pending = await Complaint.countDocuments({ status: { $nin: ['Resolved', 'Closed', 'Rejected'] } });
  const resolved = await Complaint.countDocuments({ status: 'Resolved' });
  const closed = await Complaint.countDocuments({ status: 'Closed' });

  res.json({ success: true, data: { total, pending, resolved, closed } });
};
