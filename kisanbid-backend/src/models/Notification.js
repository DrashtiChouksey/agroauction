const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['new_bid', 'outbid', 'winning', 'sold', 'message', 'system', 'fraud_alert', 'auction_ending', 'warning'],
  },
  title: String,
  message: String,
  read: { type: Boolean, default: false },
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  bidId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid' },
  link: String,
}, { timestamps: true });

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
