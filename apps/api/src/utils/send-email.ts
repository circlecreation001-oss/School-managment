import { createTransport, Transporter } from 'nodemailer';
import { env, logger } from '../config/index.js';

// Persistent SMTP transporter (reuses TCP connection)
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
      throw new Error('SMTP not configured');
    }
    transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: { user: env.smtpUser, pass: env.smtpPass },
      pool: true, // Use connection pooling
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    logger.info({ host: env.smtpHost, port: env.smtpPort }, 'SMTP transporter initialized');
  }
  return transporter;
}

/**
 * Send an email directly via SMTP with persistent connection pool.
 * This is reliable and fast after first connection.
 */
export async function sendEmailDirect(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  try {
    const transport = getTransporter();

    const info = await transport.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      replyTo: 'circlecreation001@gmail.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    logger.info({ messageId: info.messageId, to: options.to, subject: options.subject, response: info.response }, 'Email sent via SMTP');
    return true;
  } catch (err: any) {
    logger.error({ err: err.message, code: err.code, to: options.to, subject: options.subject }, 'SMTP email send FAILED');
    // Reset transporter on connection errors so next attempt creates fresh connection
    if (err.code === 'ECONNECTION' || err.code === 'ESOCKET' || err.code === 'ETIMEDOUT') {
      transporter = null;
    }
    return false;
  }
}
