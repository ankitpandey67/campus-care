import mongoose from 'mongoose';
import { generateTicketNumber } from '../utils/generateTicket.js';

const complaintSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    location: { type: String, required: true, trim: true },
    complainant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Awaiting Complainant Response',
        'Resolved',
        'Reopened',
        'Closed',
        'Rejected',
      ],
      default: 'Submitted',
    },
    deadline: { type: Date, default: null },
    attachments: [{ type: String }],
    staffNotes: [{ type: String }],
    resolutionSummary: { type: String, default: '' },
    resolutionEvidence: [{ type: String }],
    rating: { type: Number, min: 1, max: 5, default: null },
    feedback: { type: String, default: '' },
    history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ComplaintHistory' }],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

complaintSchema.pre('validate', async function () {
  if (!this.ticketNumber) {
    this.ticketNumber = await generateTicketNumber(mongoose.model('Complaint'));
  }
});

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);
