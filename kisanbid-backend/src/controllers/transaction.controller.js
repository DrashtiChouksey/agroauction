const Transaction = require('../models/Transaction');
const exportService = require('../services/export.service');
const ApiResponse = require('../utils/apiResponse');

class TransactionController {
  async getAllTransactions(req, res) {
     try {
       const page = parseInt(req.query.page) || 1;
       const limit = parseInt(req.query.limit) || 20;
       
       const transactions = await Transaction.find()
         .sort({ createdAt: -1 })
         .skip((page - 1) * limit)
         .limit(limit);
         
       const total = await Transaction.countDocuments();
       
       return ApiResponse.paginated(res, transactions, total, page, limit);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getMyTransactions(req, res) {
     try {
       const transactions = await Transaction.find({
          $or: [{ farmerId: req.user.id }, { buyerId: req.user.id }]
       }).sort({ createdAt: -1 });
       return ApiResponse.success(res, transactions);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getTransaction(req, res) {
     try {
       const transaction = await Transaction.findById(req.params.id);
       if(!transaction) return ApiResponse.notFound(res, 'Transaction not found');
       
       if (transaction.farmerId.toString() !== req.user.id && transaction.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
          return ApiResponse.forbidden(res, 'Not authorized');
       }
       
       return ApiResponse.success(res, transaction);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async generateInvoice(req, res) {
     try {
       const transaction = await Transaction.findById(req.params.id);
       if(!transaction) return ApiResponse.notFound(res, 'Transaction not found');
       
       if (transaction.farmerId.toString() !== req.user.id && transaction.buyerId.toString() !== req.user.id && req.user.role !== 'admin') {
          return ApiResponse.forbidden(res, 'Not authorized');
       }
       
       await exportService.generateInvoice(res, transaction);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async getPendingPayouts(req, res) {
     try {
       const transactions = await Transaction.find({ payoutStatus: 'pending', status: 'completed' }).sort({ createdAt: 1 });
       return ApiResponse.success(res, transactions);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async markPayout(req, res) {
     try {
       const transaction = await Transaction.findByIdAndUpdate(req.params.id, {
          payoutStatus: 'paid', payoutDate: new Date()
       }, { new: true });
       return ApiResponse.success(res, transaction, 'Payout marked as paid');
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }

  async bulkPayout(req, res) {
     try {
       const { transactionIds } = req.body;
       await Transaction.updateMany(
          { _id: { $in: transactionIds } },
          { payoutStatus: 'paid', payoutDate: new Date() }
       );
       return ApiResponse.success(res, null, `${transactionIds.length} payouts processed`);
     } catch(error) {
        return ApiResponse.error(res, error.message);
     }
  }
}

module.exports = new TransactionController();
