import { createTransport } from 'nodemailer';
import { env, logger } from '../config/index.js';

/**
 * Send an email directly via SMTP (bypasses BullMQ queue).
 * Used as fallback when Redis/BullMQ is unavailable, or for critical emails
 * that must be sent immediately (e.g., verification, password reset).
 */
export async function sendEmailDirect(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  if (!env.smtpHost || !env.smtpUser) {
    logger.warn('SMTP not configured — cannot send email');
    return false;
  }

  try {
    const transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });

    const info = await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      replyTo: 'circlecreation001@gmail.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    logger.info({ messageId: info.messageId, to: options.to, subject: options.subject }, 'Email sent directly via SMTP');
    return true;
  } catch (err: any) {
    logger.error({ err: err.message, to: options.to }, 'Direct email send failed');
    return false;
  }
}
