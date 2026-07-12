import { Queue, Worker, QueueEvents } from 'bullmq';
import { env } from './env.js';
import { logger } from './logger.js';

const connection = {
  host: env.redisHost,
  port: env.redisPort,
  password: env.redisPassword,
};

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
    logger.error({ err, queue: name }, 'Queue error');
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
    logger.error({ jobId: job?.id, queue: name, err }, 'Job failed');
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
