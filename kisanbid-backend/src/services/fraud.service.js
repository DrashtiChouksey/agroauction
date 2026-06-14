const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const { getIo } = require('../socket/socket');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

const FRAUD_RULES = {
  rapidBidding: { bidsInMinutes: 10, timeWindowMinutes: 5 },
  priceSpikeRatio: 3.0,
  multipleAccountSameIp: true,
  bidRetractionPattern: { retractions: 3, inDays: 7 },
};

class FraudService {
  async analyzeBid(bid, buyerId, ipAddress) {
    const alerts = [];
    
    try {
      // Rule 1: Rapid bidding
      const recentBids = await Bid.countDocuments({
        buyerId,
        createdAt: { $gte: new Date(Date.now() - FRAUD_RULES.rapidBidding.timeWindowMinutes * 60 * 1000) }
      });
      
      if (recentBids >= FRAUD_RULES.rapidBidding.bidsInMinutes) {
        alerts.push({
          type: 'rapid_bidding',
          severity: 'high',
          message: `Buyer placed ${recentBids} bids in ${FRAUD_RULES.rapidBidding.timeWindowMinutes} minutes`,
          userId: buyerId,
        });
      }
      
      // Rule 2: Price spike (bid > 3x base price)
      const crop = await Crop.findById(bid.cropId);
      if (crop && bid.bidAmount > crop.basePrice * FRAUD_RULES.priceSpikeRatio) {
        alerts.push({
          type: 'price_spike',
          severity: 'medium',
          message: `Bid ₹${bid.bidAmount} is ${(bid.bidAmount/crop.basePrice).toFixed(1)}x base price`,
          userId: buyerId,
        });
      }
      
      // Rule 3: Same IP multiple accounts
      if (ipAddress && FRAUD_RULES.multipleAccountSameIp) {
        const sameIpBids = await Bid.find({ ipAddress, cropId: bid.cropId }).distinct('buyerId');
        // We add +1 because current bid might not be saved yet when this runs, 
        // or if it is saved, we check length > 1
        // Let's assume current bid IS NOT saved yet, so we just check distinct buyerIds already in DB
        
        // Actually, if we pass the saved bid, it will be in the DB.
        if (sameIpBids.length > 1) {
          alerts.push({
            type: 'multiple_accounts',
            severity: 'critical',
            message: `Multiple accounts bidding from same IP: ${ipAddress}`,
            userId: buyerId,
          });
        }
      }
      
      // If alerts exist, flag bid and notify admin
      if (alerts.length > 0) {
        // Only update if bid._id exists (i.e. it was saved)
        if (bid._id) {
          await Bid.findByIdAndUpdate(bid._id, { isFlagged: true, flagReason: alerts[0].message });
        }
        
        const io = getIo();
        for (const alert of alerts) {
          logger.warn(`Fraud Alert: ${alert.message} for user ${buyerId}`);
          
          if (io) {
            io.to('admin:room').emit('admin:fraud:alert', { alert, bid, crop });
          }
          
          // Also save it as a system notification for admins (simplified)
          // In a real app, we might have a specific FraudAlert collection
        }
      }
      
      return alerts;
    } catch (error) {
      logger.error('Error analyzing bid for fraud:', error);
      return []; // Fail open, don't block bid
    }
  }

  async runScheduledScan() {
    try {
      logger.info('Running scheduled fraud scan...');
      // Additional scheduled checks could go here
      // E.g., checking for bid retraction patterns
      // const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      // const retractions = await ActivityLog.aggregate([...])
    } catch (error) {
      logger.error('Error running scheduled fraud scan:', error);
    }
  }
}

module.exports = new FraudService();
