import { Job } from 'bullmq';
import { createTransport, Transporter } from 'nodemailer';
import { env, logger } from '../config/index.js';

export interface EmailJobData {
  tenantId: string;
  recipientId: string;
  to?: string;
  subject?: string;
  body: string;
  html?: string;
  channel: string;
  data?: Record<string, unknown>;
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: env.smtpUser
        ? { user: env.smtpUser, pass: env.smtpPass }
        : undefined,
    });
  }
  return transporter;
}

export async function processEmailJob(job: Job<EmailJobData>): Promise<void> {
  const { tenantId, recipientId, to, subject, body, html } = job.data;

  if (!to) {
    // Resolve email from recipientId
    const { prisma } = await import('@erp/database');
    const user = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { email: true, firstName: true },
    });
    if (!user?.email) {
      logger.warn({ jobId: job.id, recipientId }, 'Email worker: no email for recipient');
      return;
    }
    job.data.to = user.email;
  }

  const recipient = job.data.to!;
  const transport = getTransporter();

  const info = await transport.sendMail({
    from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
    to: recipient,
    subject: subject || 'Notification from Education ERP',
    text: body,
    html: html || body,
  });

  logger.info(
    { jobId: job.id, tenantId, recipientId, messageId: info.messageId },
    'Email sent successfully',
  );

  // Update notification status
  const { prisma } = await import('@erp/database');
  await prisma.notification.updateMany({
    where: { recipientId, channel: 'email', status: 'queued' },
    data: { status: 'sent', sentAt: new Date() },
  });
}
