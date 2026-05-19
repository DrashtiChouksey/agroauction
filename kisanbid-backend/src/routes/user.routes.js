const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.use(auth);

// Watchlist routes
router.get('/watchlist', userController.getWatchlist);
router.post('/watchlist/:cropId', userController.addToWatchlist);
router.delete('/watchlist/:cropId', userController.removeFromWatchlist);

// Admin user management
router.get('/', adminOnly, userController.getAllUsers);
router.post('/:id/ban', adminOnly, userController.banUser);
router.post('/:id/suspend', adminOnly, userController.suspendUser);
router.post('/:id/activate', adminOnly, userController.activateUser);
router.post('/:id/warn', adminOnly, userController.warnUser);
router.get('/:id/activity', adminOnly, userController.getUserActivity);
router.delete('/:id', adminOnly, userController.deleteUser);

// User profile routes
router.get('/:id', userController.getUser);
router.put('/:id', userController.updateUser);
router.get('/:id/crops', userController.getUserCrops);
router.get('/:id/bids', userController.getUserBids);
router.get('/:id/reviews', userController.getUserReviews);
router.get('/:id/transactions', userController.getUserTransactions);

module.exports = router;
