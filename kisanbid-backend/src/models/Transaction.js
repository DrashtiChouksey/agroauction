const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  cropName: String,
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  farmerName: String,
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  buyerName: String,
  basePrice: Number,
  finalPrice: Number,
  quantity: Number,
  quantityUnit: String,
  totalAmount: Number,
  commissionPercent: Number,
  commissionAmount: Number,
  farmerReceives: Number,
  status: { type: String, enum: ['pending', 'completed', 'refunded', 'disputed'], default: 'pending' },
  payoutStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  payoutDate: Date,
  invoiceNumber: { type: String, unique: true },
}, { timestamps: true });

TransactionSchema.index({ farmerId: 1, status: 1 });
TransactionSchema.index({ buyerId: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ payoutStatus: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
