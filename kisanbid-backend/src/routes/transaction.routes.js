const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const auth = require('../middleware/auth.middleware');
const adminOnly = require('../middleware/admin.middleware');

router.use(auth);

router.get('/my', transactionController.getMyTransactions);
router.get('/:id', transactionController.getTransaction);
router.get('/:id/invoice', transactionController.generateInvoice);

// Admin
router.get('/', adminOnly, transactionController.getAllTransactions);
router.get('/pending-payouts', adminOnly, transactionController.getPendingPayouts);
router.post('/:id/payout', adminOnly, transactionController.markPayout);
router.post('/bulk-payout', adminOnly, transactionController.bulkPayout);

module.exports = router;
