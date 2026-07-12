import { Job } from 'bullmq';
import { env, logger } from '../config/index.js';

export interface SmsJobData {
  tenantId: string;
  recipientId: string;
  phone?: string;
  body: string;
  channel: string;
  data?: Record<string, unknown>;
}

/**
 * SMS Worker Processor
 * Supports: console (dev), twilio, msg91
 * Provider is controlled via SMS_PROVIDER env var
 */
export async function processSmsJob(job: Job<SmsJobData>): Promise<void> {
  const { tenantId, recipientId, body } = job.data;
  let phone = job.data.phone;

  if (!phone) {
    const { prisma } = await import('@erp/database');
    const user = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { phone: true },
    });
    if (!user?.phone) {
      logger.warn({ jobId: job.id, recipientId }, 'SMS worker: no phone for recipient');
      return;
    }
    phone = user.phone;
  }

  const provider = process.env.SMS_PROVIDER || 'console';

  switch (provider) {
    case 'twilio':
      await sendViaTwilio(phone, body);
      break;
    case 'msg91':
      await sendViaMsg91(phone, body);
      break;
    case 'console':
    default:
      logger.info({ jobId: job.id, phone, body: body.substring(0, 50) }, 'SMS (console): message logged');
      break;
  }

  // Update notification status
  const { prisma } = await import('@erp/database');
  await prisma.notification.updateMany({
    where: { recipientId, channel: 'sms', status: 'queued' },
    data: { status: 'sent', sentAt: new Date() },
  });

  logger.info({ jobId: job.id, tenantId, phone }, 'SMS processed');
}

async function sendViaTwilio(phone: string, body: string): Promise<void> {
  // Twilio integration — requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !from) {
    logger.warn('Twilio credentials not configured, falling back to console');
    logger.info({ phone, body: body.substring(0, 50) }, 'SMS (twilio-fallback)');
    return;
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
    },
    body: new URLSearchParams({ To: phone, From: from, Body: body }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Twilio error: ${response.status} ${err}`);
  }
}

async function sendViaMsg91(phone: string, body: string): Promise<void> {
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID || 'EDUERP';

  if (!apiKey) {
    logger.warn('MSG91 API key not configured, falling back to console');
    logger.info({ phone, body: body.substring(0, 50) }, 'SMS (msg91-fallback)');
    return;
  }

  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: { authkey: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: senderId,
      route: '4',
      country: '91',
      sms: [{ message: body, to: [phone] }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`MSG91 error: ${response.status} ${err}`);
  }
}
