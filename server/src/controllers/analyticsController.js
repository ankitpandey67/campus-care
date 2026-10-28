import Complaint from '../models/Complaint.js';
import Department from '../models/Department.js';
import User from '../models/User.js';

export const dashboardMetrics = async (req, res) => {
  const totalComplaints = await Complaint.countDocuments();
  const pendingComplaints = await Complaint.countDocuments({ status: { $nin: ['Resolved', 'Closed', 'Rejected'] } });
  const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
  const resolved = await Complaint.countDocuments({ status: 'Resolved' });
  const closed = await Complaint.countDocuments({ status: 'Closed' });
  const critical = await Complaint.countDocuments({ priority: 'Critical' });
  const overdue = await Complaint.countDocuments({ deadline: { $lt: new Date() }, status: { $nin: ['Resolved', 'Closed', 'Rejected'] } });

  res.json({
    success: true,
    data: {
      totalComplaints,
      pendingComplaints,
      inProgress,
      resolved,
      closed,
      critical,
      overdue,
      resolutionRate: totalComplaints ? ((resolved + closed) / totalComplaints) * 100 : 0,
    },
  });
};

export const complaintsTrend = async (req, res) => {
  const complaints = await Complaint.aggregate([
    {
      $group: {
        _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.json({ success: true, data: complaints });
};

export const departmentOverview = async (req, res) => {
  const departments = await Department.aggregate([
    {
      $lookup: {
        from: 'complaints',
        localField: '_id',
        foreignField: 'department',
        as: 'complaints',
      },
    },
    {
      $project: {
        name: 1,
        total: { $size: '$complaints' },
      },
    },
  ]);

  res.json({ success: true, data: departments });
};

export const userOverview = async (req, res) => {
  const users = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data: users });
};
