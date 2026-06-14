const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const { apiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL_PLATFORM || 'http://localhost:3001',
    process.env.CLIENT_URL_ADMIN || 'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true,
}));
app.use(mongoSanitize());
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api/', apiLimiter);

// Passport
app.use(passport.initialize());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/crops', require('./routes/crop.routes'));
app.use('/api/bids', require('./routes/bid.routes'));
app.use('/api/messages', require('./routes/message.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/complaints', require('./routes/complaint.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/settings', require('./routes/settings.routes'));
app.use('/api/payments', require('./routes/payment.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` }
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
