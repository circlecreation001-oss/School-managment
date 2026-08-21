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
    // Timeout Redis connection attempt to 10 seconds max
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout (10s)')), 10000)),
    ]);
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Redis connection failed — running in degraded mode');
    // Don't throw — let the server start without Redis
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
}
