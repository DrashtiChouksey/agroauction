const mongoose = require('mongoose');

const PlatformSettingsSchema = new mongoose.Schema({
  commissionPercent: { type: Number, default: 5 },
  minBidIncrement: { type: Number, default: 100 },
  defaultAuctionDurationHours: { type: Number, default: 72 },
  autoExtendMinutes: { type: Number, default: 5 },
  maxBidsPerUserPerAuction: { type: Number, default: 50 },
  autoBidEnabled: { type: Boolean, default: true },
  bulkBuyEnabled: { type: Boolean, default: true },
  messagingEnabled: { type: Boolean, default: true },
  sellerRatingsEnabled: { type: Boolean, default: true },
  fraudAutoDetectionEnabled: { type: Boolean, default: true },
  emailNotificationsEnabled: { type: Boolean, default: true },
  reservePriceVisibleToBuyers: { type: Boolean, default: false },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

// Ensure only one settings document exists
PlatformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', PlatformSettingsSchema);
