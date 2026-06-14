const User = require('../models/User');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const ActivityLog = require('../models/ActivityLog');
const exportService = require('../services/export.service');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  async getDashboard(req, res) {
     try {
       const [totalUsers, activeCrops, totalBids, flaggedBids] = await Promise.all([
          User.countDocuments(),
          Crop.countDocuments({ status: 'active' }),
          Bid.countDocuments(),
          Bid.countDocuments({ isFlagged: true })
       ]);
       
       return ApiResponse.success(res, {
          totalUsers, activeCrops, totalBids, flaggedBids
       });
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getLiveAuctions(req, res) {
     try {
       const crops = await Crop.find({ status: 'active' }).sort({ expiresAt: 1 });
       return ApiResponse.success(res, crops);
     } catch (error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getFraudAlerts(req, res) {
     try {
       const flaggedBids = await Bid.find({ isFlagged: true }).sort({ createdAt: -1 });
       return ApiResponse.success(res, flaggedBids);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async dismissFraudAlert(req, res) {
     try {
       const bid = await Bid.findByIdAndUpdate(req.params.id, { isFlagged: false, flagReason: null }, { new: true });
       return ApiResponse.success(res, bid, 'Fraud alert dismissed');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async investigateFraudAlert(req, res) {
     try {
       // Could update a separate status, for now just log it
       await ActivityLog.create({
          adminId: req.user.id, adminName: req.user.name,
          action: 'INVESTIGATE', targetType: 'bid', targetId: req.params.id,
          severity: 'warning'
       });
       return ApiResponse.success(res, null, 'Marked for investigation');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getActivityLogs(req, res) {
     try {
       const page = parseInt(req.query.page) || 1;
       const limit = parseInt(req.query.limit) || 50;
       const logs = await ActivityLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
       const total = await ActivityLog.countDocuments();
       return ApiResponse.paginated(res, logs, total, page, limit);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async generateReport(req, res) {
     try {
       const { type } = req.query; // 'users', 'crops', 'transactions', etc
       let data = [];
       
       switch(type) {
          case 'users': data = await User.find().lean(); break;
          case 'crops': data = await Crop.find().lean(); break;
          case 'bids': data = await Bid.find().lean(); break;
          default: return ApiResponse.validationError(res, 'Invalid report type');
       }
       
       await exportService.exportCSV(res, type, data);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async removeCrop(req, res) {
     try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, { status: 'removed' }, { new: true });
        
        await ActivityLog.create({
           adminId: req.user.id, adminName: req.user.name,
           action: 'REMOVE_CROP', targetType: 'crop', targetId: crop._id, targetName: crop.cropName,
           severity: 'warning'
        });
        
        return ApiResponse.success(res, crop, 'Crop removed forcefully');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
  
  async flagCrop(req, res) {
      try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, { isFlagged: true }, { new: true });
        return ApiResponse.success(res, crop, 'Crop flagged');
      } catch(error) {
         return ApiResponse.error(res, error.message);
      }
  }

  async cancelBid(req, res) {
     try {
        // Implementation similar to bidController.cancelBid but forced by admin
        // ...
        await Bid.findByIdAndDelete(req.params.id);
        return ApiResponse.success(res, null, 'Bid cancelled forcefully');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async clearBids(req, res) {
     try {
        await Bid.deleteMany({});
        await Crop.updateMany({}, { currentHighestBid: 0, currentHighestBidderId: null, currentHighestBidderName: null, totalBids: 0 });
        
        await ActivityLog.create({
           adminId: req.user.id, adminName: req.user.name,
           action: 'DANGER_CLEAR_BIDS', targetType: 'settings', targetId: 'all',
           severity: 'critical'
        });
        
        return ApiResponse.success(res, null, 'ALL bids cleared');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async resetToSeed(req, res) {
     try {
        // Danger zone: implemented in seed script actually, here we might just call it
        return ApiResponse.success(res, null, 'Feature disabled in production');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
}

module.exports = new AdminController();
