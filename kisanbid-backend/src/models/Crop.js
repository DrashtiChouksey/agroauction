const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName: String,
  farmerRating: Number,
  cropName: { type: String, required: true, trim: true },
  variety: String,
  quantity: { type: Number, required: true },
  quantityUnit: { type: String, enum: ['kg', 'quintal', 'ton'], default: 'quintal' },
  basePrice: { type: Number, required: true },
  reservePrice: Number,
  autoAcceptPrice: Number,
  currentHighestBid: { type: Number, default: 0 },
  currentHighestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  currentHighestBidderName: String,
  totalBids: { type: Number, default: 0 },
  photoUrl: String,
  photos: [String],
  harvestDate: Date,
  season: { type: String, enum: ['Kharif', 'Rabi', 'Summer', 'Zaid'] },
  grade: { type: String, enum: ['A+', 'A', 'B', 'C'] },
  isOrganic: { type: Boolean, default: false },
  description: String,
  storageConditions: String,
  status: { type: String, enum: ['active', 'sold', 'removed', 'expired'], default: 'active' },
  expiresAt: { type: Date, required: true },
  autoExtended: { type: Boolean, default: false },
  autoExtendCount: { type: Number, default: 0 },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
  soldAt: Date,
  soldPrice: Number,
  soldToId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  soldToName: String,
  commission: Number,
  views: { type: Number, default: 0 },
  watchlistCount: { type: Number, default: 0 },
}, { timestamps: true });

CropSchema.index({ status: 1, expiresAt: 1 });
CropSchema.index({ farmerId: 1 });
CropSchema.index({ cropName: 1, status: 1 });
CropSchema.index({ season: 1 });
CropSchema.index({ grade: 1 });
CropSchema.index({ isOrganic: 1 });

module.exports = mongoose.model('Crop', CropSchema);
