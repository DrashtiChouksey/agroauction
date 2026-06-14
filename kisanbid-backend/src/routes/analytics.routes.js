const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.use(auth);

// Farmer analytics
router.get('/farmer/revenue', analyticsController.getFarmerRevenue);
router.get('/farmer/crops-performance', analyticsController.getFarmerCropsPerformance);
router.get('/farmer/bid-activity', analyticsController.getFarmerBidActivity);
router.get('/farmer/top-buyers', analyticsController.getFarmerTopBuyers);

// Buyer analytics
router.get('/buyer/spending', analyticsController.getBuyerSpending);
router.get('/buyer/purchases', analyticsController.getBuyerPurchases);
router.get('/buyer/bid-history', analyticsController.getBuyerBidHistory);

// Admin analytics
router.get('/admin/overview', adminOnly, analyticsController.getAdminOverview);
router.get('/admin/gmv', adminOnly, analyticsController.getAdminGMV);
router.get('/admin/users-growth', adminOnly, analyticsController.getAdminUsersGrowth);
router.get('/admin/crops-by-category', adminOnly, analyticsController.getAdminCropsByCategory);
router.get('/admin/top-farmers', adminOnly, analyticsController.getAdminTopFarmers);
router.get('/admin/top-buyers', adminOnly, analyticsController.getAdminTopBuyers);
router.get('/admin/bids-activity', adminOnly, analyticsController.getAdminBidsActivity);
router.get('/admin/by-state', adminOnly, analyticsController.getAdminByState);

module.exports = router;
