import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    defaultDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    defaultSlaHours: { type: Number, default: 48 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
