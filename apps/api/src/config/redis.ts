import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// Support Upstash Redis URL (standard ioredis connection via rediss://)
// Upstash provides both REST API and standard Redis protocol URLs.
// For ioredis, use the standard URL from Upstash dashboard (starts with rediss://)
const redisUrl = env.redisUrl;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    if (times > 3) return null; // Stop after 3 attempts in dev
    return Math.min(times * 500, 3000);
  },
  lazyConnect: true,
  connectTimeout: 5000,
  // TLS is required for Upstash (rediss:// URLs)
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}),
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err: err.message }, 'Redis connection error');
});

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (err: any) {
    logger.error({ err: err.message }, 'Failed to connect to Redis');
    if (env.nodeEnv === 'production') {
      throw err;
    }
    logger.warn('Redis unavailable — running in degraded mode (no caching, no queues)');
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
