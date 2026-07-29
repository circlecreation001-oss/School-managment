import crypto from 'crypto';
import { redis, logger } from '../../config/index.js';
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

    // Check resend cooldown (30 seconds)
    const cooldown = await redis.get(cooldownKey);
    if (cooldown) {
      throw new AppError(429, 'OTP_COOLDOWN', 'Please wait 30 seconds before requesting a new OTP.');
    }

    // Check max sends per hour
    const sendCount = await redis.get(sendCountKey);
    if (sendCount && parseInt(sendCount) >= OTP_MAX_SENDS) {
      throw new AppError(429, 'OTP_LIMIT', 'Too many OTP requests. Please try again later.');
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP before storing
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    // Store in Redis: hashed OTP + attempt counter
    await redis.setex(key, OTP_EXPIRY_SECONDS, JSON.stringify({
      hash: hashedOtp,
      attempts: 0,
      createdAt: Date.now(),
    }));

    // Set cooldown
    await redis.setex(cooldownKey, OTP_RESEND_COOLDOWN, '1');

    // Increment send count (expires in 1 hour)
    const current = await redis.incr(sendCountKey);
    if (current === 1) await redis.expire(sendCountKey, 3600);

    logger.info({ email: normalizedEmail, purpose }, 'OTP generated');
    return otp;
  }

  /**
   * Verify an OTP against the stored hash.
   */
  async verifyOtp(email: string, otp: string, purpose: 'signup' | 'login' | 'reset' | 'invite'): Promise<boolean> {
    const normalizedEmail = email.toLowerCase().trim();
    const key = `otp:${purpose}:${normalizedEmail}`;

    const stored = await redis.get(key);
    if (!stored) {
      throw new AppError(400, 'OTP_EXPIRED', 'OTP has expired or was not generated. Please request a new one.');
    }

    const data = JSON.parse(stored) as { hash: string; attempts: number; createdAt: number };

    // Check max attempts
    if (data.attempts >= OTP_MAX_ATTEMPTS) {
      await redis.del(key);
      throw new AppError(429, 'OTP_MAX_ATTEMPTS', 'Too many incorrect attempts. Please request a new OTP.');
    }

    // Hash the provided OTP and compare
    const hashedInput = crypto.createHash('sha256').update(otp).digest('hex');

    if (hashedInput !== data.hash) {
      // Increment attempts
      data.attempts++;
      const ttl = await redis.ttl(key);
      await redis.setex(key, ttl > 0 ? ttl : OTP_EXPIRY_SECONDS, JSON.stringify(data));
      throw new AppError(400, 'OTP_INVALID', `Invalid OTP. ${OTP_MAX_ATTEMPTS - data.attempts} attempts remaining.`);
    }

    // OTP verified - delete it (single use)
    await redis.del(key);
    logger.info({ email: normalizedEmail, purpose }, 'OTP verified successfully');
    return true;
  }

  /**
   * Send OTP via email queue.
   */
  async sendOtpEmail(email: string, otp: string, purpose: string): Promise<void> {
    try {
      const { emailQueue } = await import('../../config/index.js');
      const subjects: Record<string, string> = {
        signup: 'SchoolNex - Verify Your Email',
        login: 'SchoolNex - Login Verification',
        reset: 'SchoolNex - Password Reset OTP',
        invite: 'SchoolNex - Account Activation',
      };
      await emailQueue.add('send-otp', {
        to: email,
        subject: subjects[purpose] || 'SchoolNex - Verification Code',
        body: `Your SchoolNex verification code is: ${otp}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.\n\nIf you did not request this, please ignore this email.`,
        tenantId: 'platform',
      });
    } catch (err) {
      logger.warn({ err, email }, 'Failed to queue OTP email (non-fatal)');
    }
  }
}

export const otpService = new OtpService();
