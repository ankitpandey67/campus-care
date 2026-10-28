import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['student', 'staff', 'admin'],
      default: 'student',
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    studentId: { type: String, default: '' },
    phone: { type: String, default: '' },
    accountStatus: { type: String, enum: ['active', 'inactive'], default: 'active' },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', userSchema);
