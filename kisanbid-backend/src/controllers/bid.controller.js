const Bid = require('../models/Bid');
const Crop = require('../models/Crop');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const auctionService = require('../services/auction.service');
const biddingService = require('../services/bidding.service');
const fraudService = require('../services/fraud.service');
const notificationService = require('../services/notification.service');
const { getIo } = require('../socket/socket');
const ApiResponse = require('../utils/apiResponse');

class BidController {
  async placeBid(req, res) {
    try {
      const { cropId, bidAmount, isAutoBid, autoBidMax } = req.body;
      const buyerId = req.user.id;
      const ipAddress = req.ip;

      const settings = await PlatformSettings.findOne() || await PlatformSettings.create({});

      // 1. Validations
      if (req.user.role !== 'buyer' && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Only buyers can place bids');
      }

      if (req.user.status !== 'active') {
        return ApiResponse.forbidden(res, 'Your account is not active');
      }

      const crop = await Crop.findById(cropId);
      if (!crop) return ApiResponse.notFound(res, 'Crop not found');
      
      if (crop.status !== 'active') return ApiResponse.validationError(res, `Auction is ${crop.status}`);
      if (crop.expiresAt < new Date()) return ApiResponse.validationError(res, 'Auction has expired');
      if (crop.farmerId.toString() === buyerId) return ApiResponse.validationError(res, 'Cannot bid on your own crop');

      if (bidAmount < crop.basePrice) {
        return ApiResponse.validationError(res, `Bid must be at least the base price of ₹${crop.basePrice}`);
      }

      const minIncrement = settings.minBidIncrement || 100;
      if (crop.currentHighestBid > 0 && bidAmount < crop.currentHighestBid + minIncrement) {
        return ApiResponse.validationError(res, `Bid must be at least ₹${minIncrement} higher than current bid`);
      }

      // Check user bid limit
      const userBidsInAuction = await Bid.countDocuments({ cropId, buyerId });
      if (userBidsInAuction >= settings.maxBidsPerUserPerAuction) {
        return ApiResponse.validationError(res, 'Maximum bids limit reached for this auction');
      }

      // Check auto-bid settings
      if (isAutoBid && !settings.autoBidEnabled) {
        return ApiResponse.validationError(res, 'Auto-bidding is currently disabled on the platform');
      }

      // 2. Create the bid
      const bid = new Bid({
        cropId: crop._id,
        cropName: crop.cropName,
        farmerId: crop.farmerId,
        farmerName: crop.farmerName,
        buyerId,
        buyerName: req.user.name,
        bidAmount,
        previousHighestBid: crop.currentHighestBid,
        isAutoBid,
        autoBidMax,
        status: 'winning',
        ipAddress,
      });

      // 3. Check for fraud before saving
      if (settings.fraudAutoDetectionEnabled) {
         await fraudService.analyzeBid(bid, buyerId, ipAddress);
      }

      await bid.save();

      // 4. Update previous bids
      await Bid.updateMany(
        { cropId, _id: { $ne: bid._id }, status: 'winning' },
        { status: 'outbid' }
      );

      // 5. Update Crop
      const updatedCrop = await Crop.findByIdAndUpdate(
        cropId,
        {
          currentHighestBid: bidAmount,
          currentHighestBidderId: buyerId,
          currentHighestBidderName: req.user.name,
          $inc: { totalBids: 1 }
        },
        { new: true }
      );
      
      // Update User stats
      await User.findByIdAndUpdate(buyerId, { $inc: { totalBidsPlaced: 1 } });

      // 6. Socket emit
      const io = getIo();
      if (io) {
        io.to(`auction:${cropId}`).emit('bid:new', {
          cropId,
          bidAmount,
          buyerName: req.user.name,
          timestamp: bid.createdAt,
          currentHighestBid: bidAmount,
          totalBids: updatedCrop.totalBids
        });

        if (crop.currentHighestBidderId && crop.currentHighestBidderId.toString() !== buyerId.toString()) {
           io.to(`user:${crop.currentHighestBidderId}`).emit('bid:outbid', {
              cropId,
              cropName: crop.cropName,
              newHighestBid: bidAmount
           });
        }
      }

      // 7. Process auction lifecycle (auto-extend, auto-accept)
      const auctionResult = await auctionService.processBidPlacement(cropId, bid, settings);

      // 8. Notifications
      if (!auctionResult.autoAccepted) { // If auto-accepted, the auction service handles notifications
          await notificationService.sendBidNotifications(updatedCrop, bid);
          if(crop.currentHighestBidderId && crop.currentHighestBidderId.toString() !== buyerId.toString()) {
              await notificationService.sendOutbidNotification(crop.currentHighestBidderId, updatedCrop, bidAmount);
          }
      }

      // 9. Process Auto-bids (Counters)
      if (!auctionResult.autoAccepted && settings.autoBidEnabled) {
         // Async execution so we don't block response
         biddingService.processAutoBids(cropId, bidAmount, buyerId, settings).catch(err => {
             console.error('Error in background auto-bidding:', err);
         });
      }

      return ApiResponse.created(res, { bid, crop: updatedCrop }, 'Bid placed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getAllBids(req, res) {
    try {
      const bids = await Bid.find().sort({ createdAt: -1 }).limit(100);
      return ApiResponse.success(res, bids);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getBid(req, res) {
    try {
      const bid = await Bid.findById(req.params.id);
      if (!bid) return ApiResponse.notFound(res, 'Bid not found');
      return ApiResponse.success(res, bid);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getMyBids(req, res) {
    try {
      const status = req.query.status;
      const filter = { buyerId: req.user.id };
      if (status) filter.status = status;

      const bids = await Bid.find(filter).sort({ createdAt: -1 });
      return ApiResponse.success(res, bids);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async cancelBid(req, res) {
    try {
      const bid = await Bid.findById(req.params.id);
      if (!bid) return ApiResponse.notFound(res, 'Bid not found');

      if (bid.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized to cancel this bid');
      }

      const crop = await Crop.findById(bid.cropId);
      if (!crop) return ApiResponse.notFound(res, 'Crop not found');

      // Only allow cancellation if it's the highest bid and no other bids have been placed over it
      // OR if admin overrides
      if (crop.currentHighestBidderId.toString() !== bid.buyerId.toString() && req.user.role !== 'admin') {
          return ApiResponse.validationError(res, 'Can only cancel if you are the current highest bidder');
      }
      
      // If we remove the highest bid, we need to rollback the crop's current highest bid
      if (crop.currentHighestBidderId.toString() === bid.buyerId.toString()) {
          // Find next highest
          const nextBid = await Bid.findOne({ cropId: crop._id, _id: { $ne: bid._id } }).sort({ bidAmount: -1 });
          
          crop.currentHighestBid = nextBid ? nextBid.bidAmount : crop.basePrice;
          crop.currentHighestBidderId = nextBid ? nextBid.buyerId : null;
          crop.currentHighestBidderName = nextBid ? nextBid.buyerName : null;
          crop.totalBids = Math.max(0, crop.totalBids - 1);
          await crop.save();
          
          if (nextBid) {
              nextBid.status = 'winning';
              await nextBid.save();
          }
          
          const io = getIo();
          if (io) {
             io.to(`auction:${crop._id}`).emit('bid:new', {
                cropId: crop._id,
                bidAmount: crop.currentHighestBid,
                buyerName: crop.currentHighestBidderName,
                timestamp: new Date(),
                currentHighestBid: crop.currentHighestBid,
                totalBids: crop.totalBids
             });
          }
      }

      await Bid.findByIdAndDelete(req.params.id);

      return ApiResponse.success(res, null, 'Bid cancelled successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async flagBid(req, res) {
    try {
      const bid = await Bid.findByIdAndUpdate(
        req.params.id,
        { isFlagged: true, flagReason: req.body.reason },
        { new: true }
      );
      return ApiResponse.success(res, bid, 'Bid flagged');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async setupAutoBid(req, res) {
    try {
      // Setup auto-bid is just placing a bid with isAutoBid = true
      return this.placeBid(req, res);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async cancelAutoBid(req, res) {
    try {
       await Bid.updateMany(
           { cropId: req.params.cropId, buyerId: req.user.id, isAutoBid: true, status: 'winning' },
           { isAutoBid: false, autoBidMax: null }
       );
       return ApiResponse.success(res, null, 'Auto-bid cancelled successfully');
    } catch (error) {
       return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new BidController();
