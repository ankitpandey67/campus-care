import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Department from '../models/Department.js';
import Category from '../models/Category.js';
import Complaint from '../models/Complaint.js';

export const seedDemoData = async () => {
  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    const departments = await Department.insertMany([
      { name: 'Electrical', description: 'Power and lighting issues', active: true },
      { name: 'Plumbing', description: 'Water supply and drainage', active: true },
      { name: 'IT Support', description: 'Network and Wi-Fi issues', active: true },
      { name: 'Hostel Maintenance', description: 'Hostel repairs and facilities', active: true },
    ]);

    const categories = await Category.insertMany([
      { name: 'Wi-Fi', description: 'Internet and connectivity', defaultDepartment: departments[2]._id, defaultSlaHours: 24 },
      { name: 'Electricity', description: 'Power outage and circuit issues', defaultDepartment: departments[0]._id, defaultSlaHours: 12 },
      { name: 'Plumbing', description: 'Water and drainage issues', defaultDepartment: departments[1]._id, defaultSlaHours: 36 },
      { name: 'Hostel', description: 'Accommodation facilities', defaultDepartment: departments[3]._id, defaultSlaHours: 48 },
    ]);

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@campus.com',
      password: adminPassword,
      role: 'admin',
      accountStatus: 'active',
    });

    const staffPassword = await bcrypt.hash('Staff@123', 10);
    const staff = await User.create({
      name: 'Maintenance Staff',
      email: 'staff@campus.com',
      password: staffPassword,
      role: 'staff',
      department: departments[0]._id,
      accountStatus: 'active',
    });

    await Department.findByIdAndUpdate(departments[0]._id, { head: staff._id, staff: [staff._id] });

    const studentPassword = await bcrypt.hash('Student@123', 10);
    const student = await User.create({
      name: 'Demo Student',
      email: 'student@campus.com',
      password: studentPassword,
      role: 'student',
      studentId: 'STU-101',
      accountStatus: 'active',
    });

    await Complaint.create({
      title: 'Wi-Fi outage in Lab 2',
      description: 'Internet not working in the computer lab for the last 2 hours.',
      category: categories[0]._id,
      location: 'Computer Lab 2',
      complainant: student._id,
      department: departments[2]._id,
      assignee: staff._id,
      priority: 'High',
      status: 'In Progress',
      deadline: new Date(Date.now() + 6 * 60 * 60 * 1000),
    });

    return { admin, staff, student };
  }

  return null;
};
