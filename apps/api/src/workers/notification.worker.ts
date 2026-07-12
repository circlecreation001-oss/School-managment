import { Job } from 'bullmq';
import { logger, emitToUser } from '../config/index.js';
import { processEmailJob, type EmailJobData } from './email.worker.js';
import { processSmsJob, type SmsJobData } from './sms.worker.js';
import { processWhatsappJob, type WhatsappJobData } from './whatsapp.worker.js';

export interface NotificationJobData {
  tenantId: string;
  recipientId: string;
  channel: string;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
  phone?: string;
  to?: string;
}

/**
 * Unified Notification Worker
 * Routes to the correct channel processor based on the `channel` field
 */
export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const { channel, tenantId, recipientId, subject, body, data } = job.data;

  logger.debug(
    { jobId: job.id, channel, tenantId, recipientId },
    'Processing notification job',
  );

  switch (channel) {
    case 'email':
      await processEmailJob(job as unknown as Job<EmailJobData>);
      break;

    case 'sms':
      await processSmsJob(job as unknown as Job<SmsJobData>);
      break;

    case 'whatsapp':
      await processWhatsappJob(job as unknown as Job<WhatsappJobData>);
      break;

    case 'push':
      await processPushNotification(recipientId, subject, body, data);
      break;

    case 'in_app':
      await processInAppNotification(recipientId, subject, body);
      break;

    default:
      logger.warn({ jobId: job.id, channel }, 'Unknown notification channel');
  }
}

async function processPushNotification(
  recipientId: string,
  subject?: string,
  body?: string,
  data?: Record<string, unknown>,
): Promise<void> {
  // FCM integration placeholder — requires FIREBASE_SERVICE_ACCOUNT env
  const fcmKey = process.env.FCM_SERVER_KEY;

  if (!fcmKey) {
    logger.info({ recipientId, subject }, 'Push notification (console): FCM not configured');
    return;
  }

  // In production, fetch user's FCM device tokens from DB and send via FCM
  logger.info({ recipientId, subject }, 'Push notification queued (FCM integration pending device tokens)');
}

async function processInAppNotification(
  recipientId: string,
  subject?: string,
  body?: string,
): Promise<void> {
  // Emit via Socket.IO for real-time delivery
  emitToUser(recipientId, 'notification:new', { subject, body, timestamp: new Date().toISOString() });

  // Mark as delivered
  const { prisma } = await import('@erp/database');
  await prisma.notification.updateMany({
    where: { recipientId, channel: 'in_app', status: 'queued' },
    data: { status: 'delivered', sentAt: new Date() },
  });

  logger.debug({ recipientId, subject }, 'In-app notification delivered via Socket.IO');
}
