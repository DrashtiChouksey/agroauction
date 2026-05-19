export type Role = 'farmer' | 'buyer' | 'admin';

export type User = {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  email?: string;
  location?: string;
  farmSize?: string;
  cropTypes?: string[];
  isOrganic?: boolean;
  rating?: number;
  reviewCount?: number;
  joinedAt: string;
  profilePhoto?: string;
  bankAccount?: string;
  ifscCode?: string;
  upiId?: string;
};

export type Crop = {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerRating?: number;
  cropName: string;
  variety: string;
  quantity: number;
  quantityUnit: 'kg' | 'quintal' | 'ton';
  basePrice: number;
  reservePrice?: number;
  currentHighestBid: number;
  photoUrl: string;
  harvestDate: string;
  season?: string;
  grade: 'A+' | 'A' | 'B' | 'C';
  isOrganic: boolean;
  status: 'active' | 'sold' | 'removed';
  batchId?: string;
  description?: string;
  storageConditions?: string;
  createdAt: string;
  soldAt?: string;
  soldPrice?: number;
  soldToId?: string;
  soldToName?: string;
  autoAcceptPrice?: number;
  expiresAt?: string;
};

export type Bid = {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  bidAmount: number;
  timestamp: string;
  status: 'winning' | 'outbid' | 'won' | 'lost';
};

export type Message = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  content: string;
  timestamp: string;
  read: boolean;
};

export type Review = {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  rating: number;
  comment: string;
  timestamp: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: 'new_bid' | 'outbid' | 'winning' | 'sold' | 'message' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  cropId?: string;
};

export type WatchlistItem = {
  cropId: string;
  addedAt: string;
};

export type Toast = {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
};

export type Transaction = {
  id: string;
  cropId: string;
  cropName: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  totalAmount: number;
  commissionAmount: number;
  farmerReceives: number;
  status: 'pending' | 'completed' | 'failed';
  payoutStatus: 'pending' | 'paid';
  createdAt: string;
};

export type AppState = {
  currentUser: User | null;
  users: User[];
  crops: Crop[];
  bids: Bid[];
  messages: Message[];
  reviews: Review[];
  notifications: Notification[];
  watchlist: WatchlistItem[];
  toasts: Toast[];
  language: string;
  transactions: Transaction[];
  walletBalance: number;
  loading: boolean;
};

export type Complaint = {
  id: string;
  type: 'fraud' | 'quality' | 'payment' | 'spam' | 'other';
  severity: 'urgent' | 'high' | 'medium' | 'low';
  complainantId: string;
  complainantName: string;
  accusedId: string;
  accusedName: string;
  cropId?: string;
  amount?: number;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
};

export type ActivityLog = {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  target: string;
  targetId: string;
  timestamp: string;
  details?: string;
};

export type PlatformSettings = {
  commissionPercent: number;
  minBidIncrement: number;
  defaultAuctionDuration: number;
  autoExtendMinutes: number;
  maxBidsPerUser: number;
  autoBidEnabled: boolean;
  bulkBuyEnabled: boolean;
  messagingEnabled: boolean;
  sellerRatingsEnabled: boolean;
};

export type AdminState = {
  adminUser: { id: string; name: string; role: 'admin'; } | null;
  users: User[];
  crops: Crop[];
  bids: Bid[];
  complaints: Complaint[];
  activityLogs: ActivityLog[];
  settings: PlatformSettings;
  bannedUsers: string[];
  flaggedListings: string[];
  toasts: Toast[];
};
