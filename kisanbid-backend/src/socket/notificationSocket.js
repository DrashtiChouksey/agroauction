// Primarily for handling read receipts via socket if needed
const { getIo } = require('./socket');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const setupNotificationSocket = () => {
    const io = getIo();
    if (!io) return;

    io.on('connection', (socket) => {
        socket.on('notification:read', async ({ notificationId }) => {
            try {
                if (notificationId) {
                    await Notification.findByIdAndUpdate(notificationId, { read: true });
                } else {
                    // Mark all as read
                    await Notification.updateMany({ userId: socket.user.id }, { read: true });
                }
            } catch (err) {
                logger.error('Error marking notification read via socket:', err);
            }
        });
    });
};

module.exports = { setupNotificationSocket };
