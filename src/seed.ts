export const seedData = {
  users: [
    { id: 'f1', name: 'Ram Niwas Singh', role: 'farmer', location: 'Madhya Pradesh', farmSize: '15 acres', rating: 4.8, reviewCount: 24, joinedAt: '2024-01-10', cropTypes: ['Rice','Wheat'], isOrganic: true },
    { id: 'f2', name: 'Raj Kumar', role: 'farmer', location: 'Punjab', farmSize: '25 acres', rating: 4.9, reviewCount: 36, joinedAt: '2024-02-05', cropTypes: ['Wheat','Maize'], isOrganic: false },
    { id: 'f3', name: 'Priya Singh', role: 'farmer', location: 'Maharashtra', farmSize: '10 acres', rating: 4.7, reviewCount: 18, joinedAt: '2024-03-12', cropTypes: ['Cotton','Soybean'], isOrganic: true },
    { id: 'f4', name: 'Suresh Mishra', role: 'farmer', location: 'Uttar Pradesh', farmSize: '8 acres', rating: 4.5, reviewCount: 12, joinedAt: '2024-04-01', cropTypes: ['Tomato','Potato'], isOrganic: false },
    { id: 'f5', name: 'Vikram Patel', role: 'farmer', location: 'Gujarat', farmSize: '20 acres', rating: 4.6, reviewCount: 20, joinedAt: '2024-03-20', cropTypes: ['Cotton','Groundnut'], isOrganic: false },
    { id: 'b1', name: 'Rajesh Traders', role: 'buyer', location: 'Delhi', joinedAt: '2024-01-15', rating: 4.7, reviewCount: 30 },
    { id: 'b2', name: 'Green Organic Corp', role: 'buyer', location: 'Mumbai', joinedAt: '2024-02-10', rating: 4.9, reviewCount: 45 },
    { id: 'b3', name: 'Agro Export Ltd', role: 'buyer', location: 'Chennai', joinedAt: '2024-03-05', rating: 4.6, reviewCount: 22 },
    { id: 'b4', name: 'Fair Trade Foods', role: 'buyer', location: 'Pune', joinedAt: '2024-01-28', rating: 4.8, reviewCount: 35 },
    { id: 'b5', name: 'National Grain Corp', role: 'buyer', location: 'Kolkata', joinedAt: '2024-04-10', rating: 4.5, reviewCount: 15 },
  ],
  crops: [
    { id: 'c1', farmerId: 'f1', farmerName: 'Ram Niwas Singh', farmerRating: 4.8, cropName: 'Rice', variety: 'Basmati 1401', quantity: 50, quantityUnit: 'quintal', basePrice: 2500, currentHighestBid: 3100, photoUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', harvestDate: '2026-05-20', grade: 'A', isOrganic: true, status: 'active', createdAt: '2026-05-10', expiresAt: new Date(Date.now() + 86400000).toISOString(), season: 'Rabi' },
    { id: 'c2', farmerId: 'f2', farmerName: 'Raj Kumar', farmerRating: 4.9, cropName: 'Wheat', variety: 'HD2985', quantity: 75, quantityUnit: 'quintal', basePrice: 2800, currentHighestBid: 3900, photoUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400', harvestDate: '2026-05-15', grade: 'A+', isOrganic: false, status: 'active', createdAt: '2026-05-09', expiresAt: new Date(Date.now() + 4000000).toISOString(), season: 'Rabi' },
    { id: 'c3', farmerId: 'f3', farmerName: 'Priya Singh', farmerRating: 4.7, cropName: 'Cotton', variety: 'MCU5', quantity: 30, quantityUnit: 'quintal', basePrice: 4500, currentHighestBid: 6200, photoUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=400', harvestDate: '2026-06-01', grade: 'A', isOrganic: true, status: 'active', createdAt: '2026-05-08', expiresAt: new Date(Date.now() + 10000000).toISOString(), season: 'Kharif' },
    { id: 'c4', farmerId: 'f4', farmerName: 'Suresh Mishra', farmerRating: 4.5, cropName: 'Tomato', variety: 'Hybrid F1', quantity: 100, quantityUnit: 'kg', basePrice: 1200, currentHighestBid: 1050, photoUrl: 'https://images.unsplash.com/photo-1561136594-7f68413baa99?w=400', harvestDate: '2026-05-18', grade: 'B', isOrganic: false, status: 'active', createdAt: '2026-05-11', expiresAt: new Date(Date.now() + 2000000).toISOString(), season: 'Summer' },
    { id: 'c5', farmerId: 'f5', farmerName: 'Vikram Patel', farmerRating: 4.6, cropName: 'Groundnut', variety: 'Bold', quantity: 40, quantityUnit: 'quintal', basePrice: 5500, currentHighestBid: 7200, photoUrl: 'https://images.unsplash.com/photo-1567892320421-3c0466a9a9da?w=400', harvestDate: '2026-05-25', grade: 'A', isOrganic: false, status: 'active', createdAt: '2026-05-10', expiresAt: new Date(Date.now() + 86400000*2).toISOString(), season: 'Kharif' },
    { id: 'c8', farmerId: 'f3', farmerName: 'Priya Singh', farmerRating: 4.7, cropName: 'Soybean', variety: 'JS 95-60', quantity: 45, quantityUnit: 'quintal', basePrice: 5200, currentHighestBid: 6800, photoUrl: 'https://images.unsplash.com/photo-1612257999756-4f6df1c2eeef?w=400', harvestDate: '2026-06-10', grade: 'A', isOrganic: true, status: 'sold', soldPrice: 7200, soldToName: 'Rajesh Traders', createdAt: '2026-04-20', soldAt: '2026-05-01', season: 'Kharif' },
  ],
  bids: [
    { id: 'bid1', cropId: 'c1', cropName: 'Rice', farmerId: 'f1', farmerName: 'Ram Niwas Singh', buyerId: 'b1', buyerName: 'Rajesh Traders', bidAmount: 3100, timestamp: '2026-05-14T10:30:00', status: 'winning' },
    { id: 'bid2', cropId: 'c1', cropName: 'Rice', farmerId: 'f1', farmerName: 'Ram Niwas Singh', buyerId: 'b2', buyerName: 'Green Organic Corp', bidAmount: 2900, timestamp: '2026-05-14T09:15:00', status: 'outbid' },
    { id: 'bid3', cropId: 'c2', cropName: 'Wheat', farmerId: 'f2', farmerName: 'Raj Kumar', buyerId: 'b3', buyerName: 'Agro Export Ltd', bidAmount: 3900, timestamp: '2026-05-14T11:00:00', status: 'winning' },
    { id: 'bid4', cropId: 'c3', cropName: 'Cotton', farmerId: 'f3', farmerName: 'Priya Singh', buyerId: 'b4', buyerName: 'Fair Trade Foods', bidAmount: 6200, timestamp: '2026-05-14T08:45:00', status: 'winning' },
    { id: 'bid5', cropId: 'c5', cropName: 'Groundnut', farmerId: 'f5', farmerName: 'Vikram Patel', buyerId: 'b1', buyerName: 'Rajesh Traders', bidAmount: 7200, timestamp: '2026-05-14T12:00:00', status: 'winning' },
  ],
  complaints: [
    { id: 'comp1', type: 'payment', severity: 'urgent', complainantId: 'b1', complainantName: 'Rajesh Traders', accusedId: 'f4', accusedName: 'Suresh Mishra', amount: 5000, description: 'Paid ₹5,000 via UPI but crop was never delivered. Farmer not responding.', status: 'open', createdAt: '2026-05-14T09:00:00' },
    { id: 'comp2', type: 'quality', severity: 'high', complainantId: 'b2', complainantName: 'Green Organic Corp', accusedId: 'f2', accusedName: 'Raj Kumar', amount: 2800, description: 'Wheat was listed as Grade A but received Grade B quality.', status: 'under_review', createdAt: '2026-05-13T14:30:00' },
    { id: 'comp3', type: 'fraud', severity: 'medium', complainantId: 'f1', complainantName: 'Ram Niwas Singh', accusedId: 'b5', accusedName: 'National Grain Corp', description: 'Buyer placed multiple fake bids to inflate price then did not pay.', status: 'open', createdAt: '2026-05-12T11:00:00' },
    { id: 'comp4', type: 'spam', severity: 'low', complainantId: 'f3', complainantName: 'Priya Singh', accusedId: 'b3', accusedName: 'Agro Export Ltd', description: 'Buyer sending repeated spam messages requesting below-market prices.', status: 'resolved', createdAt: '2026-05-10T10:00:00', resolvedAt: '2026-05-11T16:00:00' },
  ]
};
