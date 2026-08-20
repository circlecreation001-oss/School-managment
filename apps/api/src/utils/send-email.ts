import { env, logger } from '../config/index.js';

/**
 * Send email via Brevo Transactional Email HTTP API.
 * This bypasses SMTP (port 587/465) which is blocked on some hosting providers (Render free tier).
 * Uses the BREVO_API_KEY environment variable.
 */
export async function sendEmailDirect(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<boolean> {
  const apiKey = env.brevoApiKey;

  // If Brevo API key is available, use HTTP API (preferred — no port restrictions)
  if (apiKey) {
    return sendViaBrevoApi(apiKey, options);
  }

  // Fallback: try SMTP (works when port 587 is not blocked)
  if (env.smtpHost && env.smtpUser && env.smtpPass) {
    // Try port 465 (SSL) first if 587 fails, as some hosts block 587
    return sendViaSmtp(options);
  }

  logger.warn('No email provider configured (neither BREVO_API_KEY nor SMTP credentials)');
  return false;
}

/**
 * Send via Brevo HTTP Transactional Email API
 * Docs: https://developers.brevo.com/reference/sendtransacemail
 */
async function sendViaBrevoApi(apiKey: string, options: { to: string; subject: string; text?: string; html?: string }): Promise<boolean> {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: env.smtpFromName || 'SchoolNex', email: env.smtpFromEmail || 'circlecreation001@gmail.com' },
        to: [{ email: options.to }],
        subject: options.subject,
        htmlContent: options.html || options.text || '',
        textContent: options.text || '',
        replyTo: { email: 'circlecreation001@gmail.com', name: 'SchoolNex' },
      }),
    });

    if (response.ok) {
      const data = await response.json() as any;
      logger.info({ to: options.to, subject: options.subject, messageId: data.messageId }, 'Email sent via Brevo API');
      return true;
    } else {
      const errorBody = await response.text();
      logger.error({ status: response.status, body: errorBody, to: options.to }, 'Brevo API email FAILED');
      return false;
    }
  } catch (err: any) {
    logger.error({ err: err.message, to: options.to }, 'Brevo API request FAILED');
    return false;
  }
}

/**
 * Fallback: Send via SMTP (Nodemailer)
 * Only works when port 587/465 is not blocked by the hosting provider.
 */
async function sendViaSmtp(options: { to: string; subject: string; text?: string; html?: string }): Promise<boolean> {
  try {
    const { createTransport } = await import('nodemailer');
    const transporter = createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      requireTLS: env.smtpPort === 587,
      auth: { user: env.smtpUser, pass: env.smtpPass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const info = await transporter.sendMail({
      from: `"${env.smtpFromName}" <${env.smtpFromEmail}>`,
      replyTo: 'circlecreation001@gmail.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    logger.info({ messageId: info.messageId, to: options.to }, 'Email sent via SMTP');
    transporter.close();
    return true;
  } catch (err: any) {
    logger.error({ err: err.message, code: err.code, to: options.to }, 'SMTP email send FAILED');
    return false;
  }
}
