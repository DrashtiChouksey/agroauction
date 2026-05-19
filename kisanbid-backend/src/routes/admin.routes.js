const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.use(auth);
router.use(adminOnly);

router.get('/dashboard', adminController.getDashboard);
router.get('/live-auctions', adminController.getLiveAuctions);
router.get('/fraud-alerts', adminController.getFraudAlerts);
router.post('/fraud-alerts/:id/dismiss', adminController.dismissFraudAlert);
router.post('/fraud-alerts/:id/investigate', adminController.investigateFraudAlert);
router.get('/activity-logs', adminController.getActivityLogs);
router.get('/reports/generate', adminController.generateReport);
router.post('/crops/:id/remove', adminController.removeCrop);
router.post('/crops/:id/flag', adminController.flagCrop);
router.post('/bids/:id/cancel', adminController.cancelBid);
router.post('/clear-bids', adminController.clearBids);
router.post('/reset-to-seed', adminController.resetToSeed);

module.exports = router;
