import { Job } from 'bullmq';
import { logger } from '../config/index.js';

export interface WhatsappJobData {
  tenantId: string;
  recipientId: string;
  phone?: string;
  body: string;
  templateName?: string;
  templateParams?: string[];
  channel: string;
  data?: Record<string, unknown>;
}

/**
 * WhatsApp Worker Processor
 * Uses WhatsApp Cloud API (Meta Business Platform)
 * Provider controlled via WHATSAPP_PROVIDER env var
 */
export async function processWhatsappJob(job: Job<WhatsappJobData>): Promise<void> {
  const { tenantId, recipientId, body, templateName, templateParams } = job.data;
  let phone = job.data.phone;

  if (!phone) {
    const { prisma } = await import('@erp/database');
    const user = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { phone: true },
    });
    if (!user?.phone) {
      logger.warn({ jobId: job.id, recipientId }, 'WhatsApp worker: no phone for recipient');
      return;
    }
    phone = user.phone;
  }

  const provider = process.env.WHATSAPP_PROVIDER || 'console';

  switch (provider) {
    case 'cloud_api':
      await sendViaCloudApi(phone, body, templateName, templateParams);
      break;
    case 'console':
    default:
      logger.info(
        { jobId: job.id, phone, body: body.substring(0, 50) },
        'WhatsApp (console): message logged',
      );
      break;
  }

  // Update notification status
  const { prisma } = await import('@erp/database');
  await prisma.notification.updateMany({
    where: { recipientId, channel: 'whatsapp', status: 'queued' },
    data: { status: 'sent', sentAt: new Date() },
  });

  logger.info({ jobId: job.id, tenantId, phone }, 'WhatsApp message processed');
}

async function sendViaCloudApi(
  phone: string,
  body: string,
  templateName?: string,
  templateParams?: string[],
): Promise<void> {
  const token = process.env.WHATSAPP_API_KEY;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    logger.warn('WhatsApp Cloud API credentials not configured, falling back to console');
    logger.info({ phone, body: body.substring(0, 50) }, 'WhatsApp (cloud-api-fallback)');
    return;
  }

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

  // Build payload — template or text message
  let payload: Record<string, unknown>;

  if (templateName) {
    payload = {
      messaging_product: 'whatsapp',
      to: phone.replace(/[^0-9]/g, ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components: templateParams
          ? [{ type: 'body', parameters: templateParams.map((p) => ({ type: 'text', text: p })) }]
          : undefined,
      },
    };
  } else {
    payload = {
      messaging_product: 'whatsapp',
      to: phone.replace(/[^0-9]/g, ''),
      type: 'text',
      text: { body },
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`WhatsApp Cloud API error: ${response.status} ${err}`);
  }
}
