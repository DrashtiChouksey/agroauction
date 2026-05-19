const mongoose = require('mongoose');

const BidSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  cropName: String,
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: String,
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  buyerName: String,
  bidAmount: { type: Number, required: true },
  previousHighestBid: Number,
  isAutoBid: { type: Boolean, default: false },
  autoBidMax: Number,
  status: { type: String, enum: ['winning', 'outbid', 'won', 'lost'], default: 'winning' },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  ipAddress: String,
}, { timestamps: true });

BidSchema.index({ cropId: 1, bidAmount: -1 });
BidSchema.index({ buyerId: 1, status: 1 });
BidSchema.index({ farmerId: 1 });
BidSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Bid', BidSchema);
