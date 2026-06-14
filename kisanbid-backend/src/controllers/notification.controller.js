const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async getNotifications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const notifications = await Notification.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments({ userId: req.user.id });

      return ApiResponse.paginated(res, notifications, total, page, limit, 'Notifications fetched successfully');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async markAllAsRead(req, res) {
    try {
      await Notification.updateMany({ userId: req.user.id, read: false }, { read: true });
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async markAsRead(req, res) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user.id },
        { read: true },
        { new: true }
      );
      if (!notification) return ApiResponse.notFound(res, 'Notification not found');
      return ApiResponse.success(res, notification);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
      if (!notification) return ApiResponse.notFound(res, 'Notification not found');
      return ApiResponse.success(res, null, 'Notification deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await Notification.countDocuments({ userId: req.user.id, read: false });
      return ApiResponse.success(res, { count });
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new NotificationController();
