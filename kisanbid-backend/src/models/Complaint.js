const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  type: { type: String, enum: ['fraud', 'quality', 'payment', 'spam', 'other'], required: true },
  severity: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium' },
  complainantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  complainantName: String,
  accusedId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accusedName: String,
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  amount: Number,
  description: { type: String, required: true },
  evidence: [String],
  status: { type: String, enum: ['open', 'under_review', 'resolved', 'dismissed'], default: 'open' },
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNote: String,
  resolution: String,
}, { timestamps: true });

ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ complainantId: 1 });
ComplaintSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('Complaint', ComplaintSchema);
