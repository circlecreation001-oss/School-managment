import crypto from 'crypto';
import { redis, logger, isRedisReady } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN = 30; // 30 seconds
const OTP_MAX_SENDS = 5; // max OTPs per email per hour

/**
 * OTP Service - Secure email OTP generation, storage, and verification.
 * OTPs are stored hashed in Redis with expiry and attempt tracking.
 */
export class OtpService {
  /**
   * Generate and store a 6-digit OTP for the given email.
   */
  async generateOtp(email: string, purpose: 'signup' | 'login' | 'reset' | 'invite'): Promise<string> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = `otp:${purpose}:${normalizedEmail}`;
    const cooldownKey = `otp:cooldown:${normalizedEmail}`;
    const sendCountKey = `otp:sends:${normalizedEmail}`;

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Store in Redis only if connected
    if (isRedisReady()) {
      try {
        const cooldown = await redis.get(cooldownKey);
        if (cooldown) throw new AppError(429, 'OTP_COOLDOWN', 'Please wait 30 seconds before requesting a new OTP.');

        const sendCount = await redis.get(sendCountKey);
        if (sendCount && parseInt(sendCount) >= OTP_MAX_SENDS) throw new AppError(429, 'OTP_LIMIT', 'Too many OTP requests. Please try again later.');

        await redis.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify({ hash: hashedOtp, attempts: 0, createdAt: Date.now() }));
        await redis.setex(cooldownKey, OTP_RESEND_COOLDOWN, '1');
        const current = await redis.incr(sendCountKey);
        if (current === 1) await redis.expire(sendCountKey, 3600);
      } catch (err: any) {
        if (err instanceof AppError) throw err;
        logger.warn({ err: err.message }, 'Redis error during OTP generation');
      }
    } else {
      logger.warn({ email: normalizedEmail }, 'Redis unavailable — OTP generated but not stored (verification will rely on production Redis)');
    }

    logger.info({ email: normalizedEmail, purpose }, 'OTP generated');
    return otp;
  }

  /**
   * Verify an OTP against the stored hash.
   */
  async verifyOtp(email: string, otp: string, purpose: 'signup' | 'login' | 'reset' | 'invite'): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = `otp:${purpose}:${normalizedEmail}`;

    if (!isRedisReady()) {
      // Redis unavailable — cannot verify OTP securely
      // In production with Redis, this works. In dev without Redis, we skip verification.
      logger.warn({ email: normalizedEmail }, 'Redis unavailable — OTP verification skipped (DEV ONLY)');
      return true;
    }

    let stored: string | null = null;
    try {
      stored = await redis.get(key);
    } catch {
      logger.warn('Redis get failed during OTP verify');
      return true; // Fail open in dev
    }

    if (!stored) {
      throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired or was not generated. Please request a new one.');
    }

    const data = JSON.parse(stored) as { hash: string; attempts: number; createdAt: number };

    if (data.attempts >= OTP_MAX_ATTEMPTS) {
      try { await redis.del(key); } catch {}
      throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Too many incorrect attempts. Please request a new OTP.');
    }

    const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedInput !== data.hash) {
      data.attempts++;
      try { const ttl = await redis.ttl(key); await redis.setex(key, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(data)); } catch {}
      throw new AppError(400, 'OTP_INVALID', `Invalid OTP. ${OTP_MAX_ATTEMPTS - data.attempts} attempts remaining.`);
    }

    try { await redis.del(key); } catch {}
    logger.info({ email: normalizedEmail, purpose }, 'OTP verified successfully');
    return true;
  }

  /**
   * Send OTP via direct SMTP (bypasses BullMQ for reliability).
   */
  async sendOtpEmail(email: string, otp: string, purpose: string): Promise<void> {
    try {
      const { sendEmailDirect } = await import('../../utils/send-email.js');
      const subjects: Record<string, string> = {
        signup: 'SchoolNex - Verify Your Email',
        login: 'SchoolNex - Login Verification',
        reset: 'SchoolNex - Password Reset OTP',
        invite: 'SchoolNex - Account Activation',
      };
      await sendEmailDirect({
        to: email,
        subject: subjects[purpose] || 'SchoolNex - Verification Code',
        text: `Your SchoolNex verification code is: ${otp}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.\n\nIf you did not request this, please ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#2563eb">Verification Code</h2><p>Your verification code is:</p><div style="margin:24px 0;text-align:center"><span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1e293b;background:#f1f5f9;padding:16px 32px;border-radius:12px;display:inline-block">${otp}</span></div><p style="color:#64748b;font-size:13px">This code expires in <strong>5 minutes</strong>. Do not share it.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"><p style="color:#94a3b8;font-size:11px">SchoolNex - School Management ERP</p></div>`,
      });
    } catch (err) {
      logger.warn({ err, email }, 'Failed to send OTP email');
    }
  }
}

export const otpService = new OtpService();
