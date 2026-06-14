const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: { type: String, required: true, index: true },
  fromId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromName: String,
  toId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toName: String,
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  readAt: Date,
  cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
}, { timestamps: true });

MessageSchema.index({ fromId: 1, toId: 1 });
MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
