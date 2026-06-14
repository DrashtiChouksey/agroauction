const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const User = require('../models/User');
const PlatformSettings = require('../models/PlatformSettings');
const ApiResponse = require('../utils/apiResponse');

class CropController {
  async getAllCrops(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const skip = (page - 1) * limit;

      const filter = { status: req.query.status || 'active' };

      // Apply filters
      if (req.query.cropName) filter.cropName = { $regex: req.query.cropName, $options: 'i' };
      if (req.query.grade) filter.grade = { $in: req.query.grade.split(',') };
      if (req.query.isOrganic) filter.isOrganic = req.query.isOrganic === 'true';
      if (req.query.season) filter.season = req.query.season;
      if (req.query.quantityUnit) filter.quantityUnit = req.query.quantityUnit;
      
      if (req.query.minPrice || req.query.maxPrice) {
        filter.currentHighestBid = {};
        if (req.query.minPrice) filter.currentHighestBid.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice) filter.currentHighestBid.$lte = Number(req.query.maxPrice);
      }
      
      if (req.query.minQuantity) {
        filter.quantity = { $gte: Number(req.query.minQuantity) };
      }

      if (req.query.state) {
        const usersInState = await User.find({ state: req.query.state }).distinct('_id');
        filter.farmerId = { $in: usersInState };
      }

      // Sorting
      let sort = {};
      const sortBy = req.query.sortBy || 'createdAt';
      const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
      sort[sortBy] = sortOrder;

      const crops = await Crop.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(sort);
        
      const total = await Crop.countDocuments(filter);

      return ApiResponse.paginated(res, crops, total, page, limit, 'Crops fetched successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getCrop(req, res) {
    try {
      const crop = await Crop.findById(req.params.id);
      if (!crop) return ApiResponse.notFound(res, 'Crop not found');
      
      // Increment views
      crop.views += 1;
      await crop.save();
      
      return ApiResponse.success(res, crop);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async createCrop(req, res) {
    try {
      const settings = await PlatformSettings.findOne() || await PlatformSettings.create({});
      const durationHours = settings.defaultAuctionDurationHours || 72;
      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

      const cropData = {
        ...req.body,
        farmerId: req.user.id,
        farmerName: req.user.name,
        farmerRating: req.user.rating,
        currentHighestBid: req.body.basePrice,
        expiresAt: req.body.expiresAt || expiresAt
      };

      const crop = await Crop.create(cropData);
      
      await User.findByIdAndUpdate(req.user.id, { $inc: { totalCropsListed: 1 } });

      return ApiResponse.created(res, crop, 'Crop listed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async updateCrop(req, res) {
    try {
      const crop = await Crop.findById(req.params.id);
      if (!crop) return ApiResponse.notFound(res, 'Crop not found');

      if (crop.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized to update this crop');
      }

      // Don't allow updating price if bids exist
      if (crop.totalBids > 0 && (req.body.basePrice || req.body.reservePrice)) {
         return ApiResponse.validationError(res, 'Cannot update prices after bids are placed');
      }

      Object.assign(crop, req.body);
      await crop.save();

      return ApiResponse.success(res, crop, 'Crop updated successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async deleteCrop(req, res) {
    try {
      const crop = await Crop.findById(req.params.id);
      if (!crop) return ApiResponse.notFound(res, 'Crop not found');

      if (crop.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized to delete this crop');
      }

      if (crop.totalBids > 0 && req.user.role !== 'admin') {
        return ApiResponse.validationError(res, 'Cannot delete crop with active bids. Contact admin.');
      }

      crop.status = 'removed';
      await crop.save();

      return ApiResponse.success(res, null, 'Crop removed successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getCropBids(req, res) {
    try {
      const bids = await Bid.find({ cropId: req.params.id }).sort({ bidAmount: -1 });
      return ApiResponse.success(res, bids);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getFarmerCrops(req, res) {
    try {
      const crops = await Crop.find({ farmerId: req.params.farmerId }).sort({ createdAt: -1 });
      return ApiResponse.success(res, crops);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getTrendingCrops(req, res) {
    try {
      const crops = await Crop.find({ status: 'active' })
        .sort({ totalBids: -1, views: -1 })
        .limit(6);
      return ApiResponse.success(res, crops);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getExpiringSoon(req, res) {
    try {
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
      const crops = await Crop.find({ 
        status: 'active',
        expiresAt: { $lte: twoHoursFromNow, $gte: new Date() }
      }).sort({ expiresAt: 1 });
      return ApiResponse.success(res, crops);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async extendAuction(req, res) {
    try {
       const crop = await Crop.findById(req.params.id);
       if (!crop) return ApiResponse.notFound(res, 'Crop not found');
       
       if (crop.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
         return ApiResponse.forbidden(res, 'Not authorized');
       }
       
       const { hours = 24 } = req.body;
       crop.expiresAt = new Date(crop.expiresAt.getTime() + hours * 60 * 60 * 1000);
       await crop.save();
       
       return ApiResponse.success(res, crop, 'Auction extended successfully');
    } catch (error) {
       return ApiResponse.error(res, error.message);
    }
  }

  async markSold(req, res) {
     try {
       const crop = await Crop.findById(req.params.id);
       if (!crop) return ApiResponse.notFound(res, 'Crop not found');
       
       if (crop.farmerId.toString() !== req.user.id && req.user.role !== 'admin') {
         return ApiResponse.forbidden(res, 'Not authorized');
       }
       
       if(crop.status !== 'active') {
          return ApiResponse.validationError(res, 'Crop is not active');
       }
       
       const auctionService = require('../services/auction.service');
       
       if(crop.currentHighestBidderId) {
          await auctionService.closeAuction(crop._id, crop.currentHighestBidderId, crop.currentHighestBid);
          return ApiResponse.success(res, null, 'Crop marked as sold to highest bidder');
       } else {
          return ApiResponse.validationError(res, 'Cannot mark sold. No bids received.');
       }
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async flagCrop(req, res) {
     try {
       const { reason } = req.body;
       const crop = await Crop.findByIdAndUpdate(req.params.id, {
          isFlagged: true, flagReason: reason
       }, { new: true });
       return ApiResponse.success(res, crop, 'Crop flagged successfully');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async approveCrop(req, res) {
     try {
       const crop = await Crop.findByIdAndUpdate(req.params.id, {
          isFlagged: false, flagReason: null
       }, { new: true });
       return ApiResponse.success(res, crop, 'Crop approved successfully');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
}

module.exports = new CropController();
