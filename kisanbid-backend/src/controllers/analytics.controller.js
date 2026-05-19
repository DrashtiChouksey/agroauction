const analyticsService = require('../services/analytics.service');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');

class AnalyticsController {
  async getFarmerRevenue(req, res) {
    try {
      const { from, to, period } = req.query;
      const data = await analyticsService.getFarmerRevenue(req.user.id, from, to, period);
      return ApiResponse.success(res, data);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getFarmerCropsPerformance(req, res) {
    try {
      const crops = await Crop.find({ farmerId: req.user.id })
        .select('cropName views totalBids soldPrice status quantity quantityUnit')
        .sort({ views: -1 });
      return ApiResponse.success(res, crops);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getFarmerBidActivity(req, res) {
    try {
      // Simplified for brevity
      const bids = await Bid.find({ farmerId: req.user.id }).sort({ createdAt: -1 }).limit(50);
      return ApiResponse.success(res, bids);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getFarmerTopBuyers(req, res) {
     // Optional
     return ApiResponse.success(res, []);
  }

  async getBuyerSpending(req, res) {
     return ApiResponse.success(res, []);
  }

  async getBuyerPurchases(req, res) {
     return ApiResponse.success(res, []);
  }
  
  async getBuyerBidHistory(req, res) {
     return ApiResponse.success(res, []);
  }

  // Admin Analytics
  async getAdminOverview(req, res) {
     try {
       const [totalUsers, totalCrops, activeAuctions, totalBids] = await Promise.all([
          User.countDocuments(),
          Crop.countDocuments(),
          Crop.countDocuments({ status: 'active' }),
          Bid.countDocuments()
       ]);
       
       return ApiResponse.success(res, {
          totalUsers, totalCrops, activeAuctions, totalBids
       });
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getAdminGMV(req, res) {
    try {
      const { from, to, period } = req.query;
      const data = await analyticsService.getAdminGMV(from, to, period);
      return ApiResponse.success(res, data);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getAdminUsersGrowth(req, res) {
    try {
      const { from, to, period } = req.query;
      const data = await analyticsService.getAdminUsersGrowth(from, to, period);
      return ApiResponse.success(res, data);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getAdminCropsByCategory(req, res) {
     try {
       const data = await Crop.aggregate([
          { $group: { _id: '$cropName', count: { $sum: 1 } } },
          { $sort: { count: -1 } }
       ]);
       return ApiResponse.success(res, data);
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getAdminTopFarmers(req, res) {
     try {
        const topFarmers = await User.find({ role: 'farmer' }).sort({ totalRevenue: -1 }).limit(10).select('name totalRevenue');
        return ApiResponse.success(res, topFarmers);
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getAdminTopBuyers(req, res) {
     try {
        const topBuyers = await User.find({ role: 'buyer' }).sort({ totalSpent: -1 }).limit(10).select('name totalSpent');
        return ApiResponse.success(res, topBuyers);
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getAdminBidsActivity(req, res) {
     return ApiResponse.success(res, []);
  }

  async getAdminByState(req, res) {
     try {
       const data = await User.aggregate([
          { $group: { _id: '$state', count: { $sum: 1 } } }
       ]);
       return ApiResponse.success(res, data);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
}

module.exports = new AnalyticsController();
