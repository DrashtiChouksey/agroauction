const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const notificationService = require('./notification.service');
const { getIo } = require('../socket/socket');
const logger = require('../utils/logger');

class AuctionService {
  async processBidPlacement(cropId, bid, settings) {
    try {
      const crop = await Crop.findById(cropId);
      const io = getIo();
      
      // Check autoAcceptPrice
      if (crop.autoAcceptPrice && bid.bidAmount >= crop.autoAcceptPrice) {
        logger.info(`Bid amount ${bid.bidAmount} meets auto-accept price ${crop.autoAcceptPrice} for crop ${cropId}`);
        await this.closeAuction(cropId, bid.buyerId, bid.bidAmount);
        return { autoAccepted: true };
      }
      
      // Auto-extend if bid in last N minutes
      const minutesLeft = (crop.expiresAt - Date.now()) / 60000;
      if (minutesLeft <= settings.autoExtendMinutes && crop.autoExtendCount < 3) {
        const newExpiry = new Date(crop.expiresAt.getTime() + settings.autoExtendMinutes * 60000);
        await Crop.findByIdAndUpdate(cropId, { 
          expiresAt: newExpiry, 
          $inc: { autoExtendCount: 1 },
          autoExtended: true 
        });
        
        if (io) {
          io.to(`auction:${cropId}`).emit('auction:extended', { cropId, newExpiresAt: newExpiry });
        }
        logger.info(`Auction ${cropId} extended. New expiry: ${newExpiry}`);
      }
      
      // The logic for processing auto-bids from other buyers is called from the controller directly 
      // via biddingService.processAutoBids to avoid circular dependencies
      
      // Notifications are also handled in the controller
      
      return { success: true };
    } catch (error) {
      logger.error(`Error in processBidPlacement for crop ${cropId}:`, error);
      throw error;
    }
  }

  async checkExpiredAuctions() {
    try {
      const expiredCrops = await Crop.find({
        status: 'active',
        expiresAt: { $lte: new Date() }
      });
      
      if (expiredCrops.length > 0) {
        logger.info(`Found ${expiredCrops.length} expired auctions to process`);
      }
      
      for (const crop of expiredCrops) {
        if (crop.currentHighestBid >= (crop.reservePrice || crop.basePrice)) {
          await this.closeAuction(crop._id, crop.currentHighestBidderId, crop.currentHighestBid);
        } else {
          await Crop.findByIdAndUpdate(crop._id, { status: 'expired' });
          await notificationService.sendSystemNotification(
            crop.farmerId, 
            'Auction Expired', 
            `Your auction for ${crop.cropName} ended without meeting the reserve price.`
          );
          
          // Mark all bids as lost
          await Bid.updateMany({ cropId: crop._id }, { status: 'lost' });
          logger.info(`Auction ${crop._id} expired without meeting reserve price`);
        }
      }
    } catch (error) {
      logger.error('Error in checkExpiredAuctions:', error);
    }
  }

  async closeAuction(cropId, winnerId, finalPrice) {
    try {
      const settings = await PlatformSettings.findOne() || await PlatformSettings.create({});
      
      // Find the winner to get their name
      const winner = await User.findById(winnerId);
      if (!winner) throw new Error('Winner not found');

      const commissionAmount = (finalPrice * settings.commissionPercent) / 100;
      
      // Update crop
      const crop = await Crop.findByIdAndUpdate(cropId, {
        status: 'sold',
        soldAt: new Date(),
        soldPrice: finalPrice,
        soldToId: winnerId,
        soldToName: winner.name,
        commission: commissionAmount,
      }, { new: true });
      
      if (!crop) throw new Error('Crop not found');

      // Update all bids: winner = 'won', others = 'lost'
      await Bid.updateMany({ cropId, buyerId: winnerId, status: 'winning' }, { status: 'won' });
      await Bid.updateMany({ cropId, status: { $in: ['winning', 'outbid'] } }, { status: 'lost' });
      
      // Create transaction record
      const transaction = await Transaction.create({
        cropId, cropName: crop.cropName,
        farmerId: crop.farmerId, farmerName: crop.farmerName,
        buyerId: winnerId, buyerName: winner.name,
        basePrice: crop.basePrice, finalPrice,
        quantity: crop.quantity, quantityUnit: crop.quantityUnit,
        totalAmount: finalPrice * crop.quantity, // Is it per unit or total? Assuming bid is per unit or total. Based on spec, it's ambiguous. Let's assume bidAmount is per quantity unit. If it's total, it should be just finalPrice. Let's assume totalAmount is finalPrice * quantity
        commissionPercent: settings.commissionPercent,
        commissionAmount: commissionAmount * crop.quantity, // Adjusting commission
        farmerReceives: (finalPrice - commissionAmount) * crop.quantity,
        invoiceNumber: `KB-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      });
      
      // The totalAmount logic: let's adjust it to make sense with the seed data. 
      // Usually bidAmount is per quintal/kg.
      const totalAmount = finalPrice * crop.quantity;
      const totalCommission = commissionAmount * crop.quantity;
      const farmerReceives = totalAmount - totalCommission;

      transaction.totalAmount = totalAmount;
      transaction.commissionAmount = totalCommission;
      transaction.farmerReceives = farmerReceives;
      await transaction.save();

      // Update farmer stats
      await User.findByIdAndUpdate(crop.farmerId, {
        $inc: { totalRevenue: totalAmount }
      });
      
      // Update buyer stats
      await User.findByIdAndUpdate(winnerId, {
        $inc: { totalSpent: totalAmount, wonAuctions: 1 }
      });
      
      const io = getIo();
      if (io) {
        io.to(`auction:${cropId}`).emit('auction:closed', { cropId, winnerId, finalPrice });
      }
      
      await notificationService.sendAuctionClosedNotifications(crop, winnerId, finalPrice);
      
      logger.info(`Auction ${cropId} successfully closed. Winner: ${winnerId}, Final Price: ${finalPrice}`);
      return transaction;
    } catch (error) {
      logger.error(`Error closing auction ${cropId}:`, error);
      throw error;
    }
  }
}

module.exports = new AuctionService();
