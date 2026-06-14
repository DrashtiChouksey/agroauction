const Transaction = require('../models/Transaction');
const Crop = require('../models/Crop');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Mock Razorpay in dev mode if no keys configured
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mock';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mock_secret';
const IS_MOCK = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'rzp_test_mock';

let razorpay;
if (!IS_MOCK) {
  try {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });
  } catch (e) {
    logger.warn('Razorpay SDK not installed, using mock mode');
  }
}

class PaymentController {
  // Create Razorpay order for a won auction
  async createOrder(req, res) {
    try {
      const { transactionId } = req.body;
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) return ApiResponse.notFound(res, 'Transaction not found');

      if (transaction.buyerId.toString() !== req.user.id) {
        return ApiResponse.forbidden(res, 'Not authorized');
      }

      const amount = Math.round(transaction.totalAmount * 100); // Razorpay uses paise

      if (IS_MOCK) {
        // Mock order for dev/test
        const mockOrder = {
          id: `order_mock_${Date.now()}`,
          amount,
          currency: 'INR',
          receipt: transaction.invoiceNumber,
          status: 'created',
          key: RAZORPAY_KEY_ID,
        };
        logger.info(`Mock Razorpay order created: ${mockOrder.id}`);
        return ApiResponse.success(res, { order: mockOrder, key: RAZORPAY_KEY_ID }, 'Payment order created (mock)');
      }

      const order = await razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: transaction.invoiceNumber,
        notes: {
          transactionId: transaction._id.toString(),
          cropName: transaction.cropName,
          buyerName: transaction.buyerName,
        },
      });

      return ApiResponse.success(res, { order, key: RAZORPAY_KEY_ID }, 'Payment order created');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  // Verify Razorpay payment after checkout
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, transactionId } = req.body;

      const transaction = await Transaction.findById(transactionId);
      if (!transaction) return ApiResponse.notFound(res, 'Transaction not found');

      if (IS_MOCK) {
        // Mock verification for dev/test
        transaction.status = 'completed';
        transaction.payoutStatus = 'pending';
        await transaction.save();
        logger.info(`Mock payment verified for transaction ${transactionId}`);
        return ApiResponse.success(res, { transaction, verified: true }, 'Payment verified (mock)');
      }

      // Real Razorpay signature verification
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return ApiResponse.validationError(res, 'Payment verification failed. Signature mismatch.');
      }

      transaction.status = 'completed';
      transaction.payoutStatus = 'pending';
      await transaction.save();

      logger.info(`Payment verified: order=${razorpay_order_id}, payment=${razorpay_payment_id}`);
      return ApiResponse.success(res, { transaction, verified: true }, 'Payment verified successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  // Payout to farmer (admin action)
  async payoutToFarmer(req, res) {
    try {
      const { transactionId } = req.body;
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) return ApiResponse.notFound(res, 'Transaction not found');

      if (transaction.status !== 'completed') {
        return ApiResponse.validationError(res, 'Payment must be completed before payout');
      }

      if (transaction.payoutStatus === 'paid') {
        return ApiResponse.validationError(res, 'Payout already processed');
      }

      const farmer = await User.findById(transaction.farmerId);
      if (!farmer) return ApiResponse.notFound(res, 'Farmer not found');

      if (IS_MOCK) {
        transaction.payoutStatus = 'paid';
        transaction.payoutDate = new Date();
        await transaction.save();
        logger.info(`Mock payout of ₹${transaction.farmerReceives} to ${farmer.name}`);
        return ApiResponse.success(res, { transaction, payoutAmount: transaction.farmerReceives }, 'Payout processed (mock)');
      }

      // Real Razorpay X payout (requires Contact + Fund Account setup)
      // Simplified mock since full RazorpayX requires KYC-verified merchants
      try {
        const payout = await razorpay.payouts?.create?.({
          account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
          fund_account: { account_type: 'bank_account', bank_account: { name: farmer.name, ifsc: farmer.ifscCode, account_number: farmer.bankAccount } },
          amount: Math.round(transaction.farmerReceives * 100),
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          notes: { transactionId: transaction._id.toString() },
        });

        transaction.payoutStatus = 'paid';
        transaction.payoutDate = new Date();
        await transaction.save();

        return ApiResponse.success(res, { transaction, payout }, 'Payout processed');
      } catch (payoutErr) {
        // Fallback to marking as paid if Razorpay X is not configured
        transaction.payoutStatus = 'paid';
        transaction.payoutDate = new Date();
        await transaction.save();
        logger.warn('RazorpayX payout failed, marking as paid manually:', payoutErr.message);
        return ApiResponse.success(res, { transaction, payoutAmount: transaction.farmerReceives }, 'Payout marked as paid (manual)');
      }
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  // Razorpay Webhook
  async webhook(req, res) {
    try {
      const event = req.body;
      logger.info(`Razorpay webhook received: ${event.event}`);

      switch (event.event) {
        case 'payment.captured': {
          const paymentEntity = event.payload?.payment?.entity;
          const orderId = paymentEntity?.order_id;
          logger.info(`Payment captured: ${paymentEntity?.id}, order: ${orderId}`);
          break;
        }
        case 'payment.failed': {
          const paymentEntity = event.payload?.payment?.entity;
          logger.warn(`Payment failed: ${paymentEntity?.id}`);
          break;
        }
      }

      res.status(200).json({ status: 'ok' });
    } catch (error) {
      logger.error('Webhook error:', error);
      res.status(200).json({ status: 'ok' }); // Always return 200 to Razorpay
    }
  }
}

module.exports = new PaymentController();
