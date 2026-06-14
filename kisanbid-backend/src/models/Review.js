const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName: String,
  fromRole: { type: String, enum: ['farmer', 'buyer'] },
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toName: String,
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

ReviewSchema.index({ toId: 1 });
ReviewSchema.index({ fromId: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
