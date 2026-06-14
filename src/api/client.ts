import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kisanbid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kisanbid_token');
      localStorage.removeItem('kisanbid_user');
      // Optionally redirect to login
      // window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { name: string; email: string; password: string; role: string }) => api.post('/auth/register', data),
  adminLogin: (email: string, password: string, secretCode: string) => api.post('/auth/admin/login', { email, password, secretCode }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  sendOTP: (data: { email?: string; phone?: string }) => api.post('/auth/send-otp', data),
  verifyOTP: (data: { email?: string; phone?: string; otp: string }) => api.post('/auth/verify-otp', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  refreshToken: () => api.post('/auth/refresh-token'),
};

// Crops
export const cropsAPI = {
  getAll: (params?: Record<string, any>) => api.get('/crops', { params }),
  getOne: (id: string) => api.get(`/crops/${id}`),
  create: (data: any) => api.post('/crops', data),
  update: (id: string, data: any) => api.put(`/crops/${id}`, data),
  delete: (id: string) => api.delete(`/crops/${id}`),
  getTrending: () => api.get('/crops/trending'),
  getExpiringSoon: () => api.get('/crops/expiring-soon'),
  getBids: (id: string) => api.get(`/crops/${id}/bids`),
};

// Bids
export const bidsAPI = {
  place: (data: { cropId: string; bidAmount: number; isAutoBid?: boolean; autoBidMax?: number }) => api.post('/bids', data),
  getMyBids: (status?: string) => api.get('/bids/buyer/my-bids', { params: { status } }),
  cancel: (id: string) => api.delete(`/bids/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: (page?: number) => api.get('/notifications', { params: { page } }),
  markAllRead: () => api.put('/notifications/read-all'),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  getUnreadCount: () => api.get('/notifications/unread/count'),
};

// Messages
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (conversationId: string) => api.get(`/messages/${conversationId}`),
  send: (data: { toId: string; content: string; cropId?: string }) => api.post('/messages', data),
  getUnreadCount: () => api.get('/messages/unread/count'),
};

// Reviews
export const reviewsAPI = {
  submit: (data: any) => api.post('/reviews', data),
  getUserReviews: (userId: string) => api.get(`/reviews/user/${userId}`),
};

// Payments
export const paymentsAPI = {
  createOrder: (transactionId: string) => api.post('/payments/create-order', { transactionId }),
  verifyPayment: (data: any) => api.post('/payments/verify', data),
};

// Transactions
export const transactionsAPI = {
  getMy: () => api.get('/transactions/my'),
  getOne: (id: string) => api.get(`/transactions/${id}`),
  getInvoice: (id: string) => api.get(`/transactions/${id}/invoice`, { responseType: 'blob' }),
};

// Users
export const usersAPI = {
  getUser: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  getWatchlist: () => api.get('/users/watchlist'),
  addToWatchlist: (cropId: string) => api.post(`/users/watchlist/${cropId}`),
  removeFromWatchlist: (cropId: string) => api.delete(`/users/watchlist/${cropId}`),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLiveAuctions: () => api.get('/admin/live-auctions'),
  getUsers: (params?: Record<string, any>) => api.get('/users', { params }),
  banUser: (id: string, reason: string) => api.post(`/users/${id}/ban`, { reason }),
  suspendUser: (id: string, reason: string, days: number) => api.post(`/users/${id}/suspend`, { reason, days }),
  activateUser: (id: string) => api.post(`/users/${id}/activate`),
  getComplaints: (params?: Record<string, any>) => api.get('/complaints', { params }),
  getFraudAlerts: () => api.get('/admin/fraud-alerts'),
  getActivityLogs: (page?: number) => api.get('/admin/activity-logs', { params: { page } }),
  getOverview: () => api.get('/analytics/admin/overview'),
};

export default api;
