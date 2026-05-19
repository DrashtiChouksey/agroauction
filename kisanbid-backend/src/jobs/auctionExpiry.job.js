const cron = require('node-cron');
const auctionService = require('../services/auction.service');
const Crop = require('../models/Crop');
const { getIo } = require('../socket/socket');
const logger = require('../utils/logger');

// Every minute: check for expired auctions
cron.schedule('* * * * *', async () => {
  try {
    await auctionService.checkExpiredAuctions();
  } catch (error) {
    logger.error('Error in auction expiry cron job:', error);
  }
});

// Every 30 minutes: send ending-soon notifications
cron.schedule('*/30 * * * *', async () => {
  try {
    const endingSoon = await Crop.find({
      status: 'active',
      expiresAt: { $lte: new Date(Date.now() + 2 * 60 * 60 * 1000) }
    });
    
    if (endingSoon.length > 0) {
      logger.info(`Sending ending soon notifications for ${endingSoon.length} auctions`);
    }

    const io = getIo();
    if (io) {
      for (const crop of endingSoon) {
        io.to(`auction:${crop._id}`).emit('auction:ending-soon', {
          cropId: crop._id,
          minutesLeft: Math.floor((crop.expiresAt - Date.now()) / 60000)
        });
      }
    }
  } catch (error) {
    logger.error('Error in auction ending-soon cron job:', error);
  }
});

logger.info('Auction cron jobs scheduled');
