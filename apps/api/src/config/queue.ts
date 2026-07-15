import { Queue, Worker, QueueEvents } from 'bullmq';
import { env } from './env.js';
import { logger } from './logger.js';

/**
 * Parse REDIS_URL into BullMQ-compatible connection options.
 * Supports: redis://host:port, rediss://user:pass@host:port (Upstash TLS)
 */
interface RedisConnectionOptions {
  host: string;
  port: number;
  password: string | undefined;
  username?: string | undefined;
  tls?: { rejectUnauthorized: boolean };
  maxRetriesPerRequest: null;
}

function parseRedisConnection(): RedisConnectionOptions {
  const url = env.redisUrl;

  try {
    const parsed = new URL(url);
    const useTls = parsed.protocol === 'rediss:';

    const opts: RedisConnectionOptions = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '6379', 10),
      password: parsed.password || undefined,
      username: parsed.username || undefined,
      maxRetriesPerRequest: null,
    };

    if (useTls) {
      opts.tls = { rejectUnauthorized: false };
    }

    return opts;
  } catch {
    return {
      host: env.redisHost || 'localhost',
      port: env.redisPort || 6379,
      password: env.redisPassword || undefined,
      maxRetriesPerRequest: null,
    };
  }
}

const connection = parseRedisConnection();

logger.info({ host: connection.host, port: connection.port, tls: !!connection.tls }, 'BullMQ Redis connection configured');

export function createQueue(name: string): Queue {
  const queue = new Queue(name, {
    connection,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: { count: 1000 },
      removeOnFail: { count: 5000 },
    },
  });

  queue.on('error', (err) => {
    logger.error({ err: err.message, queue: name }, 'Queue error');
  });

  return queue;
}

export function createWorker(
  name: string,
  processor: ConstructorParameters<typeof Worker>[1],
  concurrency = 5,
): Worker {
  const worker = new Worker(name, processor, {
    connection,
    concurrency,
  });

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id, queue: name }, 'Job completed');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, queue: name, err: err.message }, 'Job failed');
  });

  return worker;
}

export function createQueueEvents(name: string): QueueEvents {
  return new QueueEvents(name, { connection });
}

// Pre-defined queues
export const emailQueue = createQueue('email');
export const smsQueue = createQueue('sms');
export const notificationQueue = createQueue('notification');
export const reportQueue = createQueue('report');
