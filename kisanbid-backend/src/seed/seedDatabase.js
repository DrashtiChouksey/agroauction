require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Crop = require('../models/Crop');
const Bid = require('../models/Bid');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Complaint = require('../models/Complaint');
const Transaction = require('../models/Transaction');
const PlatformSettings = require('../models/PlatformSettings');
const ActivityLog = require('../models/ActivityLog');

const MONGO_URI = process.env.MONGO_URI_LOCAL || process.env.MONGO_URI || 'mongodb://localhost:27017/kisanbid';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', MONGO_URI);

    await Promise.all([
      User.deleteMany({}), Crop.deleteMany({}), Bid.deleteMany({}),
      Message.deleteMany({}), Notification.deleteMany({}), Review.deleteMany({}),
      Complaint.deleteMany({}), Transaction.deleteMany({}), PlatformSettings.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);
    console.log('All collections cleared');

    const hashedPass = await bcrypt.hash('password123', 12);
    const adminPass = await bcrypt.hash('ADMIN_2026', 12);

    // ===== USERS =====
    const users = await User.insertMany([
      { name: 'Admin KisanBid', email: 'admin@kisanbid.com', password: adminPass, role: 'admin', status: 'active', emailVerified: true, state: 'Delhi', location: 'New Delhi' },
      { name: 'Ram Niwas Singh', email: 'farmer@kisanbid.com', password: hashedPass, role: 'farmer', status: 'active', emailVerified: true, location: 'Madhya Pradesh', state: 'Madhya Pradesh', farmSize: '15 acres', cropTypes: ['Rice','Wheat'], isOrganic: true, rating: 4.8, reviewCount: 24, totalRevenue: 582800, totalCropsListed: 8, bankAccount: '1234567890', ifscCode: 'SBIN0001234', upiId: 'ramniwas@upi' },
      { name: 'Raj Kumar', email: 'farmer2@kisanbid.com', password: hashedPass, role: 'farmer', status: 'active', emailVerified: true, location: 'Punjab', state: 'Punjab', farmSize: '25 acres', cropTypes: ['Wheat','Maize'], isOrganic: false, rating: 4.9, reviewCount: 36, totalRevenue: 420000, totalCropsListed: 5 },
      { name: 'Priya Singh', email: 'farmer3@kisanbid.com', password: hashedPass, role: 'farmer', status: 'active', emailVerified: true, location: 'Maharashtra', state: 'Maharashtra', farmSize: '10 acres', cropTypes: ['Cotton','Soybean'], isOrganic: true, rating: 4.7, reviewCount: 18, totalRevenue: 307800, totalCropsListed: 4 },
      { name: 'Suresh Mishra', email: 'farmer4@kisanbid.com', password: hashedPass, role: 'farmer', status: 'active', emailVerified: true, location: 'Uttar Pradesh', state: 'Uttar Pradesh', farmSize: '8 acres', cropTypes: ['Tomato','Potato'], isOrganic: false, rating: 4.5, reviewCount: 12 },
      { name: 'Vikram Patel', email: 'farmer5@kisanbid.com', password: hashedPass, role: 'farmer', status: 'active', emailVerified: true, location: 'Gujarat', state: 'Gujarat', farmSize: '20 acres', cropTypes: ['Cotton','Groundnut'], isOrganic: false, rating: 4.6, reviewCount: 20 },
      { name: 'Rajesh Traders', email: 'buyer@kisanbid.com', password: hashedPass, role: 'buyer', status: 'active', emailVerified: true, location: 'Delhi', state: 'Delhi', companyName: 'Rajesh Traders Pvt Ltd', rating: 4.7, reviewCount: 30, totalSpent: 750000, totalBidsPlaced: 45, wonAuctions: 8 },
      { name: 'Green Organic Corp', email: 'buyer2@kisanbid.com', password: hashedPass, role: 'buyer', status: 'active', emailVerified: true, location: 'Mumbai', state: 'Maharashtra', companyName: 'Green Organic Corp', rating: 4.9, reviewCount: 45, totalSpent: 520000, totalBidsPlaced: 40, wonAuctions: 6 },
      { name: 'Agro Export Ltd', email: 'buyer3@kisanbid.com', password: hashedPass, role: 'buyer', status: 'active', emailVerified: true, location: 'Chennai', state: 'Tamil Nadu', companyName: 'Agro Export Ltd', rating: 4.6, reviewCount: 22, totalSpent: 380000, totalBidsPlaced: 25, wonAuctions: 4 },
      { name: 'Fair Trade Foods', email: 'buyer4@kisanbid.com', password: hashedPass, role: 'buyer', status: 'active', emailVerified: true, location: 'Pune', state: 'Maharashtra', companyName: 'Fair Trade Foods', rating: 4.8, reviewCount: 35, totalSpent: 290000, totalBidsPlaced: 30, wonAuctions: 5 },
    ]);
    console.log(`Created ${users.length} users`);

    const [admin, f1, f2, f3, f4, f5, b1, b2, b3, b4] = users;

    // ===== CROPS (active + sold) =====
    const crops = await Crop.insertMany([
      // Active crops
      { farmerId: f1._id, farmerName: f1.name, farmerRating: 4.8, cropName: 'Rice', variety: 'Basmati 1401', quantity: 50, quantityUnit: 'quintal', basePrice: 2500, currentHighestBid: 3100, currentHighestBidderId: b1._id, currentHighestBidderName: b1.name, totalBids: 3, photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', harvestDate: new Date('2026-05-20'), grade: 'A', isOrganic: true, status: 'active', expiresAt: new Date(Date.now() + 86400000), season: 'Rabi', views: 245, watchlistCount: 18 },
      { farmerId: f2._id, farmerName: f2.name, farmerRating: 4.9, cropName: 'Wheat', variety: 'HD2985', quantity: 75, quantityUnit: 'quintal', basePrice: 2800, currentHighestBid: 3900, currentHighestBidderId: b3._id, currentHighestBidderName: b3.name, totalBids: 4, photoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', harvestDate: new Date('2026-05-15'), grade: 'A+', isOrganic: false, status: 'active', expiresAt: new Date(Date.now() + 4000000), season: 'Rabi', views: 330, watchlistCount: 24 },
      { farmerId: f3._id, farmerName: f3.name, farmerRating: 4.7, cropName: 'Cotton', variety: 'MCU5', quantity: 30, quantityUnit: 'quintal', basePrice: 4500, currentHighestBid: 6200, currentHighestBidderId: b4._id, currentHighestBidderName: b4.name, totalBids: 2, photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400', harvestDate: new Date('2026-06-01'), grade: 'A', isOrganic: true, status: 'active', expiresAt: new Date(Date.now() + 10000000), season: 'Kharif', views: 198 },
      { farmerId: f4._id, farmerName: f4.name, farmerRating: 4.5, cropName: 'Tomato', variety: 'Hybrid F1', quantity: 100, quantityUnit: 'kg', basePrice: 1200, currentHighestBid: 1800, currentHighestBidderId: b2._id, currentHighestBidderName: b2.name, totalBids: 1, photoUrl: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400', harvestDate: new Date('2026-05-18'), grade: 'B', isOrganic: false, status: 'active', expiresAt: new Date(Date.now() + 3600000), season: 'Summer', views: 87 },
      { farmerId: f5._id, farmerName: f5.name, farmerRating: 4.6, cropName: 'Groundnut', variety: 'Bold', quantity: 40, quantityUnit: 'quintal', basePrice: 5500, currentHighestBid: 7200, currentHighestBidderId: b1._id, currentHighestBidderName: b1.name, totalBids: 3, photoUrl: 'https://images.unsplash.com/photo-1567892320421-3c0466a9a9da?w=400', harvestDate: new Date('2026-05-25'), grade: 'A', isOrganic: false, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 2), season: 'Kharif', views: 156 },
      { farmerId: f1._id, farmerName: f1.name, farmerRating: 4.8, cropName: 'Maize', variety: 'DHM 117', quantity: 60, quantityUnit: 'quintal', basePrice: 2200, currentHighestBid: 2900, currentHighestBidderId: b3._id, currentHighestBidderName: b3.name, totalBids: 2, photoUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400', harvestDate: new Date('2026-06-05'), grade: 'A', isOrganic: false, status: 'active', expiresAt: new Date(Date.now() + 86400000 * 3), season: 'Kharif', views: 92 },

      // Sold crops (for transaction + wallet history)
      { farmerId: f3._id, farmerName: f3.name, farmerRating: 4.7, cropName: 'Soybean', variety: 'JS 95-60', quantity: 45, quantityUnit: 'quintal', basePrice: 5200, currentHighestBid: 7200, status: 'sold', soldPrice: 7200, soldToId: b1._id, soldToName: b1.name, soldAt: new Date('2026-05-01'), photoUrl: 'https://images.unsplash.com/photo-1612257999756-4f6df1c2eeef?w=400', harvestDate: new Date('2026-06-10'), grade: 'A', isOrganic: true, expiresAt: new Date('2026-05-01'), season: 'Kharif', views: 305 },
      { farmerId: f1._id, farmerName: f1.name, farmerRating: 4.8, cropName: 'Rice', variety: 'Pusa 1121', quantity: 35, quantityUnit: 'quintal', basePrice: 2600, currentHighestBid: 3500, status: 'sold', soldPrice: 3500, soldToId: b2._id, soldToName: b2.name, soldAt: new Date('2026-04-25'), photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', harvestDate: new Date('2026-05-10'), grade: 'A+', isOrganic: true, expiresAt: new Date('2026-04-25'), season: 'Rabi', views: 278 },
      { farmerId: f1._id, farmerName: f1.name, farmerRating: 4.8, cropName: 'Wheat', variety: 'Lokwan', quantity: 40, quantityUnit: 'quintal', basePrice: 2700, currentHighestBid: 3200, status: 'sold', soldPrice: 3200, soldToId: b1._id, soldToName: b1.name, soldAt: new Date('2026-04-15'), photoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', harvestDate: new Date('2026-04-20'), grade: 'A', isOrganic: false, expiresAt: new Date('2026-04-15'), season: 'Rabi', views: 190 },
      { farmerId: f2._id, farmerName: f2.name, farmerRating: 4.9, cropName: 'Sugarcane', variety: 'CO 86032', quantity: 100, quantityUnit: 'quintal', basePrice: 3000, currentHighestBid: 3800, status: 'sold', soldPrice: 3800, soldToId: b4._id, soldToName: b4.name, soldAt: new Date('2026-04-20'), photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400', harvestDate: new Date('2026-04-28'), grade: 'A', isOrganic: false, expiresAt: new Date('2026-04-20'), season: 'Kharif', views: 165 },
    ]);
    console.log(`Created ${crops.length} crops`);

    // ===== BIDS (rich set) =====
    const bids = await Bid.insertMany([
      { cropId: crops[0]._id, cropName: 'Rice', farmerId: f1._id, farmerName: f1.name, buyerId: b1._id, buyerName: b1.name, bidAmount: 3100, status: 'winning' },
      { cropId: crops[0]._id, cropName: 'Rice', farmerId: f1._id, farmerName: f1.name, buyerId: b2._id, buyerName: b2.name, bidAmount: 2900, status: 'outbid' },
      { cropId: crops[0]._id, cropName: 'Rice', farmerId: f1._id, farmerName: f1.name, buyerId: b4._id, buyerName: b4.name, bidAmount: 2700, status: 'outbid' },
      { cropId: crops[1]._id, cropName: 'Wheat', farmerId: f2._id, farmerName: f2.name, buyerId: b3._id, buyerName: b3.name, bidAmount: 3900, status: 'winning' },
      { cropId: crops[1]._id, cropName: 'Wheat', farmerId: f2._id, farmerName: f2.name, buyerId: b1._id, buyerName: b1.name, bidAmount: 3500, status: 'outbid' },
      { cropId: crops[1]._id, cropName: 'Wheat', farmerId: f2._id, farmerName: f2.name, buyerId: b2._id, buyerName: b2.name, bidAmount: 3200, status: 'outbid' },
      { cropId: crops[1]._id, cropName: 'Wheat', farmerId: f2._id, farmerName: f2.name, buyerId: b4._id, buyerName: b4.name, bidAmount: 3000, status: 'outbid' },
      { cropId: crops[2]._id, cropName: 'Cotton', farmerId: f3._id, farmerName: f3.name, buyerId: b4._id, buyerName: b4.name, bidAmount: 6200, status: 'winning' },
      { cropId: crops[2]._id, cropName: 'Cotton', farmerId: f3._id, farmerName: f3.name, buyerId: b3._id, buyerName: b3.name, bidAmount: 5800, status: 'outbid' },
      { cropId: crops[3]._id, cropName: 'Tomato', farmerId: f4._id, farmerName: f4.name, buyerId: b2._id, buyerName: b2.name, bidAmount: 1800, status: 'winning' },
      { cropId: crops[4]._id, cropName: 'Groundnut', farmerId: f5._id, farmerName: f5.name, buyerId: b1._id, buyerName: b1.name, bidAmount: 7200, status: 'winning' },
      { cropId: crops[4]._id, cropName: 'Groundnut', farmerId: f5._id, farmerName: f5.name, buyerId: b3._id, buyerName: b3.name, bidAmount: 6800, status: 'outbid' },
      { cropId: crops[4]._id, cropName: 'Groundnut', farmerId: f5._id, farmerName: f5.name, buyerId: b2._id, buyerName: b2.name, bidAmount: 6000, status: 'outbid' },
      { cropId: crops[5]._id, cropName: 'Maize', farmerId: f1._id, farmerName: f1.name, buyerId: b3._id, buyerName: b3.name, bidAmount: 2900, status: 'winning' },
      { cropId: crops[5]._id, cropName: 'Maize', farmerId: f1._id, farmerName: f1.name, buyerId: b1._id, buyerName: b1.name, bidAmount: 2500, status: 'outbid' },
    ]);
    console.log(`Created ${bids.length} bids`);

    // ===== TRANSACTIONS (4 completed — show wallet + analytics) =====
    const transactions = await Transaction.insertMany([
      {
        cropId: crops[6]._id, cropName: 'Soybean', farmerId: f3._id, farmerName: f3.name,
        buyerId: b1._id, buyerName: b1.name, basePrice: 5200, finalPrice: 7200,
        quantity: 45, quantityUnit: 'quintal', totalAmount: 324000,
        commissionPercent: 5, commissionAmount: 16200, farmerReceives: 307800,
        status: 'completed', payoutStatus: 'paid', payoutDate: new Date('2026-05-05'),
        invoiceNumber: 'KB-2026-001',
      },
      {
        cropId: crops[7]._id, cropName: 'Rice', farmerId: f1._id, farmerName: f1.name,
        buyerId: b2._id, buyerName: b2.name, basePrice: 2600, finalPrice: 3500,
        quantity: 35, quantityUnit: 'quintal', totalAmount: 122500,
        commissionPercent: 5, commissionAmount: 6125, farmerReceives: 116375,
        status: 'completed', payoutStatus: 'paid', payoutDate: new Date('2026-04-28'),
        invoiceNumber: 'KB-2026-002',
      },
      {
        cropId: crops[8]._id, cropName: 'Wheat', farmerId: f1._id, farmerName: f1.name,
        buyerId: b1._id, buyerName: b1.name, basePrice: 2700, finalPrice: 3200,
        quantity: 40, quantityUnit: 'quintal', totalAmount: 128000,
        commissionPercent: 5, commissionAmount: 6400, farmerReceives: 121600,
        status: 'completed', payoutStatus: 'paid', payoutDate: new Date('2026-04-18'),
        invoiceNumber: 'KB-2026-003',
      },
      {
        cropId: crops[9]._id, cropName: 'Sugarcane', farmerId: f2._id, farmerName: f2.name,
        buyerId: b4._id, buyerName: b4.name, basePrice: 3000, finalPrice: 3800,
        quantity: 100, quantityUnit: 'quintal', totalAmount: 380000,
        commissionPercent: 5, commissionAmount: 19000, farmerReceives: 361000,
        status: 'completed', payoutStatus: 'paid', payoutDate: new Date('2026-04-23'),
        invoiceNumber: 'KB-2026-004',
      },
    ]);
    console.log(`Created ${transactions.length} transactions`);

    // ===== COMPLAINTS =====
    await Complaint.insertMany([
      { type: 'payment', severity: 'urgent', complainantId: b1._id, complainantName: b1.name, accusedId: f4._id, accusedName: f4.name, amount: 5000, description: 'Paid ₹5,000 via UPI but crop was never delivered.', status: 'open' },
      { type: 'quality', severity: 'high', complainantId: b2._id, complainantName: b2.name, accusedId: f2._id, accusedName: f2.name, amount: 2800, description: 'Wheat was listed as Grade A but received Grade B quality.', status: 'under_review' },
      { type: 'fraud', severity: 'medium', complainantId: f1._id, complainantName: f1.name, accusedId: b3._id, accusedName: b3.name, description: 'Buyer placed multiple fake bids to inflate price then did not pay.', status: 'open' },
      { type: 'spam', severity: 'low', complainantId: f3._id, complainantName: f3.name, accusedId: b3._id, accusedName: b3.name, description: 'Buyer sending repeated spam messages.', status: 'resolved', resolvedAt: new Date('2026-05-11') },
    ]);
    console.log('Created 4 complaints');

    // ===== PLATFORM SETTINGS =====
    await PlatformSettings.create({});
    console.log('Created platform settings');

    // ===== NOTIFICATIONS =====
    await Notification.insertMany([
      { userId: f1._id, type: 'new_bid', title: 'New Bid on Rice', message: 'Rajesh Traders bid ₹3,100 on your Rice (Basmati 1401)', read: false, cropId: crops[0]._id },
      { userId: f1._id, type: 'new_bid', title: 'New Bid on Maize', message: 'Agro Export Ltd bid ₹2,900 on your Maize', read: false, cropId: crops[5]._id },
      { userId: f1._id, type: 'sold', title: 'Payment Received!', message: '₹1,16,375 deposited to your wallet for Rice (Pusa 1121)', read: true, cropId: crops[7]._id },
      { userId: f1._id, type: 'sold', title: 'Payment Received!', message: '₹1,21,600 deposited to your wallet for Wheat (Lokwan)', read: true, cropId: crops[8]._id },
      { userId: b1._id, type: 'winning', title: 'You are winning!', message: 'Your bid of ₹3,100 is the highest on Rice', read: false, cropId: crops[0]._id },
      { userId: b2._id, type: 'outbid', title: 'Outbid!', message: 'You have been outbid on Rice. New highest: ₹3,100', read: false, cropId: crops[0]._id },
      { userId: f3._id, type: 'sold', title: 'Crop Sold!', message: 'Your Soybean was sold to Rajesh Traders for ₹7,200/q', read: true, cropId: crops[6]._id },
    ]);
    console.log('Created 7 notifications');

    // ===== REVIEWS =====
    await Review.insertMany([
      { fromId: b1._id, fromName: b1.name, fromRole: 'buyer', toId: f3._id, toName: f3.name, rating: 5, comment: 'Excellent quality soybean delivered on time! Very professional.', cropId: crops[6]._id },
      { fromId: f3._id, fromName: f3.name, fromRole: 'farmer', toId: b1._id, toName: b1.name, rating: 5, comment: 'Very reliable buyer, quick payment after quality check.', cropId: crops[6]._id },
      { fromId: b2._id, fromName: b2.name, fromRole: 'buyer', toId: f1._id, toName: f1.name, rating: 5, comment: 'Premium Basmati rice, excellent grain quality. Will buy again!', cropId: crops[7]._id },
      { fromId: f1._id, fromName: f1.name, fromRole: 'farmer', toId: b2._id, toName: b2.name, rating: 4, comment: 'Good buyer, payment was processed within 24 hours.', cropId: crops[7]._id },
      { fromId: b1._id, fromName: b1.name, fromRole: 'buyer', toId: f1._id, toName: f1.name, rating: 5, comment: 'Wheat was exactly as described. Grade A quality confirmed.', cropId: crops[8]._id },
      { fromId: b4._id, fromName: b4.name, fromRole: 'buyer', toId: f2._id, toName: f2.name, rating: 4, comment: 'Good sugarcane, slightly delayed delivery but quality was fine.', cropId: crops[9]._id },
    ]);
    console.log('Created 6 reviews');

    // ===== ACTIVITY LOGS =====
    await ActivityLog.insertMany([
      { adminId: admin._id, adminName: admin.name, action: 'Approved payout', target: 'Transaction', targetId: transactions[0]._id, details: 'Payout of ₹3,07,800 to Priya Singh for Soybean' },
      { adminId: admin._id, adminName: admin.name, action: 'Approved payout', target: 'Transaction', targetId: transactions[1]._id, details: 'Payout of ₹1,16,375 to Ram Niwas Singh for Rice' },
      { adminId: admin._id, adminName: admin.name, action: 'Approved payout', target: 'Transaction', targetId: transactions[2]._id, details: 'Payout of ₹1,21,600 to Ram Niwas Singh for Wheat' },
      { adminId: admin._id, adminName: admin.name, action: 'Resolved complaint', target: 'Complaint', targetId: 'complaint-4', details: 'Spam complaint dismissed after investigation' },
    ]);
    console.log('Created 4 activity logs');

    // ===== MESSAGES =====
    const convId = [b1._id.toString(), f1._id.toString()].sort().join('_');
    await Message.insertMany([
      { conversationId: convId, fromId: b1._id, fromName: b1.name, toId: f1._id, toName: f1.name, content: 'Hi, I am interested in your Rice listing. Is the quality consistent across the batch?', read: true, cropId: crops[0]._id },
      { conversationId: convId, fromId: f1._id, fromName: f1.name, toId: b1._id, toName: b1.name, content: 'Yes, the entire batch is Grade A Basmati 1401. I can send you sample photos if needed.', read: true, cropId: crops[0]._id },
      { conversationId: convId, fromId: b1._id, fromName: b1.name, toId: f1._id, toName: f1.name, content: 'That would be great. Also, what are the storage conditions?', read: false, cropId: crops[0]._id },
    ]);
    console.log('Created 3 messages');

    console.log('\n✅ Seed complete! Test credentials:');
    console.log('┌──────────┬──────────────────────┬──────────────┐');
    console.log('│ Role     │ Email                │ Password     │');
    console.log('├──────────┼──────────────────────┼──────────────┤');
    console.log('│ Admin    │ admin@kisanbid.com    │ ADMIN_2026   │');
    console.log('│ Farmer   │ farmer@kisanbid.com   │ password123  │');
    console.log('│ Buyer    │ buyer@kisanbid.com    │ password123  │');
    console.log('└──────────┴──────────────────────┴──────────────┘');
    console.log('Admin secret code: ADMIN_2026');
    console.log('\n📊 Seeded data:');
    console.log(`   10 users, ${crops.length} crops (${crops.filter(c => c.status === 'active').length} active, ${crops.filter(c => c.status === 'sold').length} sold)`);
    console.log(`   ${bids.length} bids, ${transactions.length} transactions`);
    console.log(`   Farmer wallet (Ram Niwas): ₹${(116375 + 121600).toLocaleString('en-IN')} from 2 payouts`);

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
