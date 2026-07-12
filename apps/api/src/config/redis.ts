import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

// Support Upstash Redis URL (standard ioredis connection via rediss://)
// Upstash provides both REST API and standard Redis protocol URLs.
// For ioredis, use the standard URL from Upstash dashboard (starts with rediss://)
const redisUrl = env.redisUrl;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) return null; // Stop retrying after 10 attempts
    const delay = Math.min(times * 200, 5000);
    return delay;
  },
  lazyConnect: true,
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
  } catch (err) {
    logger.error({ err }, 'Failed to connect to Redis');
    throw err;
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
