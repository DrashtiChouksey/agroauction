const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const { getIo } = require('../socket/socket');
const logger = require('../utils/logger');
const notificationService = require('./notification.service');

class BiddingService {
  async processAutoBids(cropId, currentBidAmount, currentBidderId, settings) {
    try {
      // Find all auto-bids for this crop that are still valid (max > currentBidAmount)
      // Exclude the current bidder
      const autoBids = await Bid.find({
        cropId,
        isAutoBid: true,
        buyerId: { $ne: currentBidderId },
        autoBidMax: { $gt: currentBidAmount }
      }).sort({ autoBidMax: -1, createdAt: 1 }); // Highest max first, then oldest

      if (autoBids.length === 0) {
        return; // No valid auto-bids
      }

      const increment = settings.minBidIncrement || 100;
      let newHighestBid = currentBidAmount;
      let winningAutoBid = null;

      // Logic for resolving auto-bids
      if (autoBids.length === 1) {
        // Only one auto-bidder can beat the current bid
        const nextBid = Math.min(newHighestBid + increment, autoBids[0].autoBidMax);
        winningAutoBid = {
          bidder: autoBids[0],
          amount: nextBid
        };
      } else {
        // Multiple auto-bidders can beat the current bid.
        // The one with the highest autoBidMax wins.
        // If tied, the oldest wins (which is sorted first).
        const topBidder = autoBids[0];
        const secondBidder = autoBids[1];

        if (topBidder.autoBidMax > secondBidder.autoBidMax) {
          // Top bidder wins, just above second bidder's max
          const nextBid = Math.min(secondBidder.autoBidMax + increment, topBidder.autoBidMax);
          winningAutoBid = {
             bidder: topBidder,
             amount: nextBid
          };
        } else {
          // Tied max. Oldest wins at the max amount.
          winningAutoBid = {
             bidder: topBidder,
             amount: topBidder.autoBidMax
          };
        }
      }

      if (winningAutoBid) {
         logger.info(`Placing auto-bid of ₹${winningAutoBid.amount} for buyer ${winningAutoBid.bidder.buyerId}`);
         
         // Fetch the crop again to ensure we have the latest state
         const crop = await Crop.findById(cropId);
         if (!crop || crop.status !== 'active') return;

         // We need to simulate placing a new bid
         const newBid = new Bid({
            cropId: crop._id,
            cropName: crop.cropName,
            farmerId: crop.farmerId,
            farmerName: crop.farmerName,
            buyerId: winningAutoBid.bidder.buyerId,
            buyerName: winningAutoBid.bidder.buyerName,
            bidAmount: winningAutoBid.amount,
            previousHighestBid: crop.currentHighestBid,
            isAutoBid: true,
            autoBidMax: winningAutoBid.bidder.autoBidMax,
            status: 'winning',
            ipAddress: 'System (Auto-Bid)'
         });

         await newBid.save();

         // Mark previous bids as outbid
         await Bid.updateMany(
            { cropId: crop._id, _id: { $ne: newBid._id }, status: 'winning' },
            { status: 'outbid' }
         );

         // Update crop
         const updatedCrop = await Crop.findByIdAndUpdate(
            crop._id,
            {
               currentHighestBid: winningAutoBid.amount,
               currentHighestBidderId: winningAutoBid.bidder.buyerId,
               currentHighestBidderName: winningAutoBid.bidder.buyerName,
               $inc: { totalBids: 1 }
            },
            { new: true }
         );

         // Notify via sockets
         const io = getIo();
         if (io) {
            io.to(`auction:${crop._id}`).emit('bid:new', {
               cropId: crop._id,
               bidAmount: newBid.bidAmount,
               buyerName: newBid.buyerName,
               timestamp: newBid.createdAt,
               currentHighestBid: updatedCrop.currentHighestBid,
               totalBids: updatedCrop.totalBids
            });

            // Notify outbid buyer (which might be the person who just placed the manual bid)
            io.to(`user:${crop.currentHighestBidderId}`).emit('bid:outbid', {
               cropId: crop._id,
               cropName: crop.cropName,
               newHighestBid: newBid.bidAmount
            });
         }

         // Send DB notifications
         await notificationService.sendBidNotifications(updatedCrop, newBid);
         
         if(crop.currentHighestBidderId) {
             await notificationService.sendOutbidNotification(crop.currentHighestBidderId, updatedCrop, newBid.bidAmount);
         }
      }

    } catch (error) {
      logger.error(`Error processing auto-bids for crop ${cropId}:`, error);
    }
  }
}

module.exports = new BiddingService();
