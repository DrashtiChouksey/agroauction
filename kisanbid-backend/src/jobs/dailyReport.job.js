const cron = require('node-cron');
const logger = require('../utils/logger');
// const dailyReportService = require('../services/dailyReport.service');

// Daily at midnight: generate reports
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running daily report generation...');
    // await dailyReportService.generate();
    // In a full implementation, this would aggregate data and possibly email admins
  } catch (error) {
    logger.error('Error generating daily report:', error);
  }
});

logger.info('Daily report cron job scheduled');
