const Message = require('../models/Message');
const User = require('../models/User');
const { getIo } = require('../socket/socket');
const notificationService = require('../services/notification.service');
const ApiResponse = require('../utils/apiResponse');

class MessageController {
  async getConversations(req, res) {
    try {
      const messages = await Message.aggregate([
        {
          $match: {
            $or: [{ fromId: req.user._id }, { toId: req.user._id }]
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$conversationId',
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$toId', req.user._id] }, { $eq: ['$read', false] }] }, 1, 0]
              }
            }
          }
        },
        { $sort: { 'lastMessage.createdAt': -1 } }
      ]);

      return ApiResponse.success(res, messages);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getMessages(req, res) {
    try {
      const messages = await Message.find({ conversationId: req.params.conversationId })
        .sort({ createdAt: 1 });
      return ApiResponse.success(res, messages);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async sendMessage(req, res) {
    try {
      const { toId, content, cropId } = req.body;
      
      const recipient = await User.findById(toId);
      if (!recipient) return ApiResponse.notFound(res, 'Recipient not found');

      const conversationId = [req.user.id, toId].sort().join('_');

      const message = await Message.create({
        conversationId,
        fromId: req.user.id,
        fromName: req.user.name,
        toId,
        toName: recipient.name,
        content,
        cropId
      });

      const io = getIo();
      if (io) {
        io.to(`chat:${conversationId}`).emit('message:new', { message });
        
        // Also send a general notification to the recipient if they aren't in the chat room
        // This is a simplified approach; ideally we'd track who is in the room
        await notificationService.sendNotification({
          userId: toId,
          type: 'message',
          title: `New message from ${req.user.name}`,
          message: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          link: `/messages/${conversationId}`
        });
      }

      return ApiResponse.created(res, message);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async markAsRead(req, res) {
    try {
      await Message.updateMany(
        { conversationId: req.params.conversationId, toId: req.user.id, read: false },
        { read: true, readAt: new Date() }
      );

      const io = getIo();
      if (io) {
        io.to(`chat:${req.params.conversationId}`).emit('message:read', {
          conversationId: req.params.conversationId,
          userId: req.user.id
        });
      }

      return ApiResponse.success(res, null, 'Messages marked as read');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async deleteMessage(req, res) {
    try {
      const message = await Message.findById(req.params.id);
      if (!message) return ApiResponse.notFound(res, 'Message not found');

      if (message.fromId.toString() !== req.user.id) {
        return ApiResponse.forbidden(res, 'Cannot delete others messages');
      }

      await Message.findByIdAndDelete(req.params.id);
      return ApiResponse.success(res, null, 'Message deleted');
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  async getUnreadCount(req, res) {
    try {
      const count = await Message.countDocuments({ toId: req.user.id, read: false });
      return ApiResponse.success(res, { count });
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = new MessageController();
