import mongoose from 'mongoose';

const complaintHistorySchema = new mongoose.Schema(
  {
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', required: true },
    action: { type: String, required: true },
    previousValue: { type: String, default: '' },
    newValue: { type: String, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.ComplaintHistory || mongoose.model('ComplaintHistory', complaintHistorySchema);
