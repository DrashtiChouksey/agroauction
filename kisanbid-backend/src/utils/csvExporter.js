const { Parser } = require('json2csv');

const exportToCSV = (data, fields) => {
  try {
    const opts = { fields };
    const parser = new Parser(opts);
    return parser.parse(data);
  } catch (err) {
    throw new Error('CSV export failed: ' + err.message);
  }
};

const getCSVFields = (type) => {
  const fieldMap = {
    users: ['name', 'email', 'role', 'location', 'state', 'rating', 'status', 'totalRevenue', 'totalSpent', 'createdAt'],
    crops: ['cropName', 'farmerName', 'variety', 'quantity', 'quantityUnit', 'basePrice', 'currentHighestBid', 'grade', 'status', 'season', 'createdAt', 'expiresAt'],
    bids: ['cropName', 'buyerName', 'farmerName', 'bidAmount', 'status', 'isAutoBid', 'isFlagged', 'createdAt'],
    transactions: ['invoiceNumber', 'cropName', 'farmerName', 'buyerName', 'finalPrice', 'quantity', 'totalAmount', 'commissionAmount', 'farmerReceives', 'status', 'payoutStatus', 'createdAt'],
    complaints: ['type', 'severity', 'complainantName', 'accusedName', 'description', 'status', 'createdAt'],
    activityLogs: ['adminName', 'action', 'targetType', 'targetName', 'details', 'severity', 'createdAt'],
  };
  return fieldMap[type] || Object.keys(data[0] || {});
};

module.exports = { exportToCSV, getCSVFields };
