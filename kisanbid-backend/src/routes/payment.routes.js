const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

// Webhook (no auth - called by Razorpay)
router.post('/webhook', paymentController.webhook);

// Authenticated routes
router.use(auth);

router.post('/create-order', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.post('/payout', adminOnly, paymentController.payoutToFarmer);

module.exports = router;
