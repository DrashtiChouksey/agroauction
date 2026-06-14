const Notification = require('../models/Notification');
const { getIo } = require('../socket/socket');

class NotificationService {
  async sendNotification(data) {
    try {
      const notification = await Notification.create(data);
      
      const io = getIo();
      if (io) {
        io.to(`user:${data.userId}`).emit('notification:new', notification);
      }
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      return null;
    }
  }

  async sendBidNotifications(crop, bid) {
    try {
      // 1. Notify Farmer
      await this.sendNotification({
        userId: crop.farmerId,
        type: 'new_bid',
        title: 'New Bid Received',
        message: `You received a new bid of ₹${bid.bidAmount} on ${crop.cropName} from ${bid.buyerName}.`,
        cropId: crop._id,
        bidId: bid._id,
      });

      // 2. Notify Outbid Buyer
      if (bid.previousHighestBid) {
         // We need to find the user who was outbid.
         // This assumes the 'crop' passed here is the updated crop with the NEW highest bidder, 
         // and we need to look up the previous one. Or easier, we rely on the controller to pass it.
         // Let's assume the controller passed the previous winner's ID if applicable
      }
    } catch (error) {
       console.error('Error sending bid notifications:', error);
    }
  }

  async sendOutbidNotification(userId, crop, newBidAmount) {
     await this.sendNotification({
        userId: userId,
        type: 'outbid',
        title: 'You have been outbid!',
        message: `Your bid on ${crop.cropName} has been outbid. The new highest bid is ₹${newBidAmount}.`,
        cropId: crop._id,
      });
  }

  async sendAuctionClosedNotifications(crop, winnerId, finalPrice) {
    try {
      // Notify Winner
      await this.sendNotification({
        userId: winnerId,
        type: 'winning',
        title: 'Auction Won!',
        message: `Congratulations! You won the auction for ${crop.cropName} with a bid of ₹${finalPrice}.`,
        cropId: crop._id,
      });

      // Notify Farmer
      await this.sendNotification({
        userId: crop.farmerId,
        type: 'sold',
        title: 'Crop Sold',
        message: `Your crop ${crop.cropName} has been sold to a highest bidder for ₹${finalPrice}.`,
        cropId: crop._id,
      });
      
      // Notify other participants (lost)
      // This would require querying all distinct buyers for this crop except the winner
      // Implemented in auction.service.js or bid controller directly for efficiency
      
    } catch (error) {
      console.error('Error sending auction closed notifications:', error);
    }
  }

  async sendSystemNotification(userId, title, message) {
    await this.sendNotification({
        userId,
        type: 'system',
        title,
        message
    });
  }
}

module.exports = new NotificationService();
