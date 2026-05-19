const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminName: String,
  action: String,
  targetType: { type: String, enum: ['user', 'crop', 'bid', 'complaint', 'settings', 'transaction'] },
  targetId: String,
  targetName: String,
  details: String,
  ipAddress: String,
  severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
}, { timestamps: true });

ActivityLogSchema.index({ createdAt: -1 });
ActivityLogSchema.index({ adminId: 1 });
ActivityLogSchema.index({ targetType: 1 });
ActivityLogSchema.index({ severity: 1 });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
