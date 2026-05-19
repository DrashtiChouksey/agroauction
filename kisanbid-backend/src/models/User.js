const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  password: { type: String, select: false },
  googleId: { type: String, unique: true, sparse: true },
  googlePhoto: String,
  role: { type: String, enum: ['farmer', 'buyer', 'admin'], required: true },
  phone: String,
  location: String,
  state: String,
  // Farmer-specific
  farmSize: String,
  cropTypes: [String],
  isOrganic: { type: Boolean, default: false },
  certifications: [String],
  bankAccount: String,
  ifscCode: String,
  upiId: String,
  // Buyer-specific
  companyName: String,
  preferredCrops: [String],
  // Common
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  profilePhoto: String,
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  suspendedUntil: Date,
  suspendedReason: String,
  bannedReason: String,
  lastActive: { type: Date, default: Date.now },
  emailVerified: { type: Boolean, default: false },
  totalRevenue: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalCropsListed: { type: Number, default: 0 },
  totalBidsPlaced: { type: Number, default: 0 },
  wonAuctions: { type: Number, default: 0 },
  watchlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
  refreshToken: { type: String, select: false },
  resetPasswordToken: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  delete obj.__v;
  return obj;
};

UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ state: 1 });

module.exports = mongoose.model('User', UserSchema);
