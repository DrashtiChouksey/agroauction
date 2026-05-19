const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL_PLATFORM, process.env.CLIENT_URL_ADMIN],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication Middleware
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    logger.info(`User connected to Socket.IO: ${userId} (${socket.user.role})`);

    // Join personal room for notifications
    socket.join(`user:${userId}`);

    // Join crop auction rooms
    socket.on('join:auction', (cropId) => {
      socket.join(`auction:${cropId}`);
      logger.debug(`User ${userId} joined auction room: ${cropId}`);
    });

    socket.on('leave:auction', (cropId) => {
      socket.leave(`auction:${cropId}`);
    });

    // Join conversation room
    socket.on('join:conversation', (conversationId) => {
      socket.join(`chat:${conversationId}`);
    });

    // Admin joins admin room
    if (socket.user.role === 'admin') {
      socket.join('admin:room');
      logger.debug(`Admin ${userId} joined admin room`);
    }

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId}`);
      // In a full implementation, update lastActive timestamp in DB
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    logger.warn('Socket.IO is not initialized yet.');
  }
  return io;
};

module.exports = { initSocket, getIo };
