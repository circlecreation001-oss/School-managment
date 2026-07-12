import { Worker } from 'bullmq';
import { logger, createWorker } from '../config/index.js';
import { processEmailJob } from './email.worker.js';
import { processSmsJob } from './sms.worker.js';
import { processWhatsappJob } from './whatsapp.worker.js';
import { processNotificationJob } from './notification.worker.js';
import { processReportJob } from './report.worker.js';

interface WorkerInstance {
  name: string;
  worker: Worker;
}

const workers: WorkerInstance[] = [];

/**
 * Initialize all BullMQ workers
 * Call this during server bootstrap to start processing queued jobs
 */
export function startWorkers(): void {
  logger.info('Starting BullMQ workers...');

  // Email worker (concurrency: 10)
  const emailWorker = createWorker('email', processEmailJob, 10);
  workers.push({ name: 'email', worker: emailWorker });

  // SMS worker (concurrency: 5)
  const smsWorker = createWorker('sms', processSmsJob, 5);
  workers.push({ name: 'sms', worker: smsWorker });

  // Notification worker — unified router (concurrency: 10)
  const notificationWorker = createWorker('notification', processNotificationJob, 10);
  workers.push({ name: 'notification', worker: notificationWorker });

  // Report worker (concurrency: 3 — heavy operations)
  const reportWorker = createWorker('report', processReportJob, 3);
  workers.push({ name: 'report', worker: reportWorker });

  // Add error handlers with retry logging
  for (const { name, worker } of workers) {
    worker.on('error', (err) => {
      logger.error({ err, worker: name }, 'Worker error');
    });

    worker.on('failed', (job, err) => {
      const attempts = job?.attemptsMade || 0;
      const maxAttempts = 3;
      if (attempts >= maxAttempts) {
        logger.error(
          { jobId: job?.id, worker: name, attempts, err },
          'Job moved to dead letter queue (max retries exceeded)',
        );
      } else {
        logger.warn(
          { jobId: job?.id, worker: name, attempts, err },
          'Job failed, will retry',
        );
      }
    });

    worker.on('stalled', (jobId) => {
      logger.warn({ jobId, worker: name }, 'Job stalled');
    });
  }

  logger.info(
    { workers: workers.map((w) => w.name) },
    `${workers.length} workers started successfully`,
  );
}

/**
 * Gracefully shut down all workers
 */
export async function stopWorkers(): Promise<void> {
  logger.info('Stopping BullMQ workers...');
  await Promise.all(workers.map(({ name, worker }) => {
    logger.debug({ worker: name }, 'Closing worker');
    return worker.close();
  }));
  logger.info('All workers stopped');
}

/**
 * Get health status of all workers
 */
export function getWorkerHealth(): Array<{ name: string; running: boolean; closed: boolean }> {
  return workers.map(({ name, worker }) => ({
    name,
    running: worker.isRunning(),
    closed: worker.isPaused(),
  }));
}
