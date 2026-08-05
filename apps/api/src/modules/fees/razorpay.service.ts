import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import Razorpay from 'razorpay';
import { env } from '../../config/env.js';

let razorpayInstance: Razorpay | null = null;

function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!env.razorpayKeyId || !env.razorpayKeySecret) {
      throw new AppError(500, 'CONFIG_ERROR', 'Razorpay credentials not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
  }
  return razorpayInstance;
}

export interface CreateOrderInput {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export class RazorpayService {
  /**
   * Create a Razorpay order for fee payment
   */
  async createOrder(input: CreateOrderInput) {
    const razorpay = getRazorpayInstance();
    try {
      const order = await razorpay.orders.create({
        amount: input.amount,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes || {},
      });
      logger.info({ orderId: order.id, amount: input.amount, receipt: input.receipt }, 'Razorpay order created');
      return order;
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to create Razorpay order');
      throw new AppError(500, 'PAYMENT_ERROR', 'Failed to create payment order');
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const crypto = await import('crypto');
    const razorpay = getRazorpayInstance();
    
    const generatedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest('hex');
    
    return generatedSignature === input.razorpaySignature;
  }

  /**
   * Get payment details from Razorpay
   */
  async getPayment(paymentId: string) {
    const razorpay = getRazorpayInstance();
    try {
      return await razorpay.payments.fetch(paymentId);
    } catch (err: any) {
      logger.error({ err: err.message, paymentId }, 'Failed to fetch Razorpay payment');
      throw new AppError(404, 'NOT_FOUND', 'Payment not found');
    }
  }

  /**
   * Capture a payment (for authorized payments)
   */
  async capturePayment(paymentId: string, amount: number) {
    const razorpay = getRazorpayInstance();
    try {
      return await razorpay.payments.capture(paymentId, amount);
    } catch (err: any) {
      logger.error({ err: err.message, paymentId }, 'Failed to capture Razorpay payment');
      throw new AppError(500, 'PAYMENT_ERROR', 'Failed to capture payment');
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: string, amount?: number, notes?: Record<string, string>) {
    const razorpay = getRazorpayInstance();
    try {
      return await razorpay.payments.refund(paymentId, { amount, notes });
    } catch (err: any) {
      logger.error({ err: err.message, paymentId }, 'Failed to refund Razorpay payment');
      throw new AppError(500, 'PAYMENT_ERROR', 'Failed to process refund');
    }
  }
}

export const razorpayService = new RazorpayService();