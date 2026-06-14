const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const { getDateGroupFormat, getGroupByPeriod, getDateRange } = require('../utils/dateHelper');
const logger = require('../utils/logger');

class AnalyticsService {
  async getFarmerRevenue(farmerId, from, to, period) {
    const { start, end } = getDateRange(from, to);
    
    return Transaction.aggregate([
      { 
        $match: { 
          farmerId: farmerId, 
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: getDateGroupFormat(period),
          revenue: { $sum: '$farmerReceives' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);
  }

  async getAdminGMV(from, to, period) {
    const { start, end } = getDateRange(from, to);
    
    return Transaction.aggregate([
      { 
        $match: { 
          status: 'completed',
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: getDateGroupFormat(period),
          gmv: { $sum: '$totalAmount' },
          platformRevenue: { $sum: '$commissionAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1, '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
    ]);
  }

  async getAdminUsersGrowth(from, to, period) {
     const { start, end } = getDateRange(from, to);

     return User.aggregate([
        {
           $match: {
              createdAt: { $gte: start, $lte: end }
           }
        },
        {
           $group: {
              _id: { ...getDateGroupFormat(period), role: '$role' },
              count: { $sum: 1 }
           }
        },
        { $sort: { '_id.date': 1, '_id.year': 1, '_id.month': 1, '_id.week': 1 } }
     ]);
  }
}

module.exports = new AnalyticsService();
