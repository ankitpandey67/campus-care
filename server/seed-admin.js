import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Department from './src/models/Department.js';
import Category from './src/models/Category.js';

const run = async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/smart-complaint');

  const hasAdmin = await User.findOne({ email: 'admin@campus.com' });
  if (!hasAdmin) {
    const hashed = await bcrypt.hash('Admin@123', 10);
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@campus.com',
      password: hashed,
      role: 'admin',
      accountStatus: 'active',
    });
    console.log('admin-created', admin.email);
  }

  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    const departments = await Department.insertMany([
      { name: 'Electrical', description: 'Power and lighting issues', active: true },
      { name: 'Plumbing', description: 'Water supply and drainage', active: true },
      { name: 'IT Support', description: 'Network and Wi-Fi issues', active: true },
      { name: 'Hostel Maintenance', description: 'Hostel repairs and facilities', active: true },
    ]);

    await Category.insertMany([
      { name: 'Wi-Fi', description: 'Internet and connectivity', defaultDepartment: departments[2]._id, defaultSlaHours: 24 },
      { name: 'Electricity', description: 'Power outage and circuit issues', defaultDepartment: departments[0]._id, defaultSlaHours: 12 },
      { name: 'Plumbing', description: 'Water and drainage issues', defaultDepartment: departments[1]._id, defaultSlaHours: 36 },
      { name: 'Hostel', description: 'Accommodation facilities', defaultDepartment: departments[3]._id, defaultSlaHours: 48 },
    ]);

    console.log('seeded departments and categories');
  }

  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
