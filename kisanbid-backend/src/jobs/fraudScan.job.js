const cron = require('node-cron');
const fraudService = require('../services/fraud.service');
const logger = require('../utils/logger');

// Every 5 minutes: fraud scan
cron.schedule('*/5 * * * *', async () => {
  try {
    await fraudService.runScheduledScan();
  } catch (error) {
    logger.error('Error in scheduled fraud scan:', error);
  }
});

logger.info('Fraud scan cron job scheduled');
