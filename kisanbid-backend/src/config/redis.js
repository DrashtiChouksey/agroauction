const Redis = require('ioredis');
const logger = require('../utils/logger');

let redis;

const connectRedis = () => {
  const url = process.env.NODE_ENV === 'production' || process.env.DOCKER
    ? process.env.REDIS_URL
    : (process.env.REDIS_URL_LOCAL || process.env.REDIS_URL);

  redis = new Redis(url, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 10) {
        logger.error('Redis: max retries reached, giving up');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
    lazyConnect: true,
  });

  redis.on('connect', () => {
    logger.info('Redis connected successfully');
  });

  redis.on('error', (err) => {
    logger.error('Redis connection error:', err.message);
  });

  redis.on('close', () => {
    logger.warn('Redis connection closed');
  });

  redis.connect().catch((err) => {
    logger.warn('Redis initial connection failed (non-fatal):', err.message);
  });

  return redis;
};

const getRedis = () => {
  if (!redis) {
    return connectRedis();
  }
  return redis;
};

module.exports = { connectRedis, getRedis };
