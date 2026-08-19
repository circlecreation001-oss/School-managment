import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

const redisUrl = env.redisUrl;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (times > 2) return null;
    return Math.min(times * 300, 2000);
  },
  lazyConnect: true,
  connectTimeout: 3000,
  commandTimeout: 3000,
  // TLS is required for Upstash (rediss:// URLs)
  ...(redisUrl.startsWith('rediss://') ? { tls: { rejectUnauthorized: false } } : {}),
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err: err.message }, 'Redis connection error');
});

/** Check if Redis connection is ready for commands */
export function isRedisReady(): boolean {
  return redis.status === 'ready';
}

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
