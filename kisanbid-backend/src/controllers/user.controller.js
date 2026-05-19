const User = require('../models/User');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Review = require('../models/Review');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.state) filter.state = req.query.state;
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } }
        ];
      }

      const users = await User.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
        
      const total = await User.countDocuments(filter);

      return ApiResponse.paginated(res, users, total, page, limit, 'Users fetched successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return ApiResponse.notFound(res, 'User not found');
      return ApiResponse.success(res, user);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async updateUser(req, res) {
    try {
      // Users can only update themselves, unless admin
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res, 'Not authorized to update this user');
      }

      // Prevent role escalation
      const updates = { ...req.body };
      if (req.user.role !== 'admin') {
        delete updates.role;
        delete updates.status;
        delete updates.totalRevenue;
        delete updates.totalSpent;
      }

      const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
      if (!user) return ApiResponse.notFound(res, 'User not found');

      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return ApiResponse.notFound(res, 'User not found');

      // Check if user has active crops/bids
      const activeCrops = await Crop.countDocuments({ farmerId: user._id, status: 'active' });
      if (activeCrops > 0) {
        return ApiResponse.validationError(res, 'User has active listings. Remove them first.');
      }

      await User.findByIdAndDelete(req.params.id);
      
      await ActivityLog.create({
        adminId: req.user.id,
        adminName: req.user.name,
        action: 'DELETE',
        targetType: 'user',
        targetId: user._id,
        targetName: user.name,
        severity: 'warning'
      });

      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUserCrops(req, res) {
    try {
      const crops = await Crop.find({ farmerId: req.params.id }).sort({ createdAt: -1 });
      return ApiResponse.success(res, crops);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUserBids(req, res) {
    try {
      const bids = await Bid.find({ buyerId: req.params.id }).sort({ createdAt: -1 });
      return ApiResponse.success(res, bids);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUserReviews(req, res) {
    try {
      const reviews = await Review.find({ toId: req.params.id }).sort({ createdAt: -1 });
      return ApiResponse.success(res, reviews);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUserTransactions(req, res) {
    try {
      // Requires admin or own user
      if (req.user.id !== req.params.id && req.user.role !== 'admin') {
        return ApiResponse.forbidden(res);
      }

      const transactions = await Transaction.find({
        $or: [{ farmerId: req.params.id }, { buyerId: req.params.id }]
      }).sort({ createdAt: -1 });
      
      return ApiResponse.success(res, transactions);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async banUser(req, res) {
    try {
      const { reason } = req.body;
      const user = await User.findByIdAndUpdate(req.params.id, { 
        status: 'banned',
        bannedReason: reason || 'Violation of platform policies'
      }, { new: true });
      
      if (!user) return ApiResponse.notFound(res, 'User not found');

      // Cancel all active crops
      await Crop.updateMany({ farmerId: user._id, status: 'active' }, { status: 'removed' });
      // Cancel all winning bids
      // await Bid.updateMany({ buyerId: user._id, status: 'winning' }, { status: 'lost' }); // Requires complex logic to find next winner

      await ActivityLog.create({
        adminId: req.user.id, adminName: req.user.name,
        action: 'BAN', targetType: 'user', targetId: user._id, targetName: user.name,
        details: reason, severity: 'critical'
      });

      return ApiResponse.success(res, user, 'User banned successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getWatchlist(req, res) {
    try {
      const user = await User.findById(req.user.id).populate('watchlist');
      return ApiResponse.success(res, user.watchlist);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async addToWatchlist(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user.watchlist.includes(req.params.cropId)) {
        user.watchlist.push(req.params.cropId);
        await user.save();
        await Crop.findByIdAndUpdate(req.params.cropId, { $inc: { watchlistCount: 1 } });
      }
      return ApiResponse.success(res, user.watchlist, 'Added to watchlist');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async removeFromWatchlist(req, res) {
    try {
      const user = await User.findById(req.user.id);
      user.watchlist = user.watchlist.filter(id => id.toString() !== req.params.cropId);
      await user.save();
      await Crop.findByIdAndUpdate(req.params.cropId, { $inc: { watchlistCount: -1 } });
      return ApiResponse.success(res, user.watchlist, 'Removed from watchlist');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
  
  async suspendUser(req, res) {
     try {
       const { reason, days } = req.body;
       const suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
       
       const user = await User.findByIdAndUpdate(req.params.id, { 
         status: 'suspended',
         suspendedReason: reason || 'Violation of platform policies',
         suspendedUntil
       }, { new: true });
       
       if (!user) return ApiResponse.notFound(res, 'User not found');
       
       await ActivityLog.create({
         adminId: req.user.id, adminName: req.user.name,
         action: 'SUSPEND', targetType: 'user', targetId: user._id, targetName: user.name,
         details: `${reason} (${days} days)`, severity: 'high'
       });
       
       return ApiResponse.success(res, user, 'User suspended successfully');
     } catch (error) {
       return ApiResponse.error(res, error.message);
     }
  }
  
  async activateUser(req, res) {
     try {
       const user = await User.findByIdAndUpdate(req.params.id, { 
         status: 'active',
         bannedReason: null,
         suspendedReason: null,
         suspendedUntil: null
       }, { new: true });
       
       if (!user) return ApiResponse.notFound(res, 'User not found');
       
       await ActivityLog.create({
         adminId: req.user.id, adminName: req.user.name,
         action: 'ACTIVATE', targetType: 'user', targetId: user._id, targetName: user.name,
         severity: 'info'
       });
       
       return ApiResponse.success(res, user, 'User activated successfully');
     } catch (error) {
       return ApiResponse.error(res, error.message);
     }
  }
  
  async warnUser(req, res) {
      try {
        const { message } = req.body;
        const user = await User.findById(req.params.id);
        if(!user) return ApiResponse.notFound(res, 'User not found');
        
        const notificationService = require('../services/notification.service');
        await notificationService.sendSystemNotification(user._id, 'Warning', message);
        
        await ActivityLog.create({
           adminId: req.user.id, adminName: req.user.name,
           action: 'WARN', targetType: 'user', targetId: user._id, targetName: user.name,
           details: message, severity: 'warning'
        });
        
        return ApiResponse.success(res, null, 'Warning sent successfully');
      } catch (error) {
        return ApiResponse.error(res, error.message);
      }
  }
  
  async getUserActivity(req, res) {
      try {
         const logs = await ActivityLog.find({
            $or: [{ targetId: req.params.id }, { adminId: req.params.id }]
         }).sort({ createdAt: -1 }).limit(50);
         
         return ApiResponse.success(res, logs);
      } catch (error) {
          return ApiResponse.error(res, error.message);
      }
  }
}

module.exports = new UserController();
