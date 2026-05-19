const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bid.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');
const { bidLimiter } = require('../middleware/rateLimiter');
const { validate } = require('../middleware/validate');
const { placeBidSchema } = require('../validators/bid.validator');

router.use(auth);

// Buyer actions
router.post('/', bidLimiter, validate(placeBidSchema), bidController.placeBid);
router.get('/buyer/my-bids', bidController.getMyBids);
router.delete('/:id', bidController.cancelBid);
router.post('/auto-bid', bidLimiter, validate(placeBidSchema), bidController.setupAutoBid);
router.delete('/auto-bid/:cropId', bidController.cancelAutoBid);

// Admin actions
router.get('/', adminOnly, bidController.getAllBids);
router.post('/:id/flag', adminOnly, bidController.flagBid);

// Public/Common
router.get('/:id', bidController.getBid);

module.exports = router;
