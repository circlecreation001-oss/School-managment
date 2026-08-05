import { Request, Response, NextFunction } from 'express';
import { razorpayService } from './razorpay.service.js';
import { feeService } from './fee.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import crypto from 'crypto';

export class RazorpayController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.body;
      
      if (!invoiceId) {
        throw new AppError(400, 'BAD_REQUEST', 'Invoice ID is required');
      }

      // Get invoice details
      const invoice = await feeService.getInvoice(req.user!.tenantId, invoiceId);
      if (!invoice) {
        throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
      }

      const outstandingAmount = Number(invoice.outstandingAmount);
      if (outstandingAmount <= 0) {
        throw new AppError(400, 'BAD_REQUEST', 'Invoice is already paid');
      }

      // Create Razorpay order
      const order = await razorpayService.createOrder({
        amount: Math.round(outstandingAmount * 100), // Convert to paise
        currency: 'INR',
        receipt: invoice.invoiceNumber,
        notes: {
          invoiceId: invoice.id,
          tenantId: req.user!.tenantId,
          studentId: invoice.studentId,
        },
      });

      sendCreated(res, {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        keyId: process.env.RAZORPAY_KEY_ID || '',
      }, 'Razorpay order created');
    } catch (e) {
      next(e);
    }
  }

  async verifyPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature, invoiceId } = req.body;

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !invoiceId) {
        throw new AppError(400, 'BAD_REQUEST', 'Missing required payment verification fields');
      }

      // Verify signature
      const isValid = await razorpayService.verifyPayment({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!isValid) {
        throw new AppError(400, 'INVALID_SIGNATURE', 'Payment signature verification failed');
      }

      // Get payment details from Razorpay
      const paymentDetails = await razorpayService.getPayment(razorpayPaymentId);

      // Record payment in our system
      const invoice = await feeService.getInvoice(req.user!.tenantId, invoiceId);
      if (!invoice) {
        throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
      }

      const outstandingAmount = Number(invoice.outstandingAmount);
      const paidAmount = Math.round(Number(paymentDetails.amount) / 100); // Convert from paise

      if (paidAmount > outstandingAmount) {
        throw new AppError(400, 'BAD_REQUEST', 'Payment amount exceeds outstanding amount');
      }

      const receiptNumber = await feeService.recordPayment(req.user!.tenantId, {
        invoiceId: invoice.id,
        amount: paidAmount,
        paymentMethod: 'online',
        transactionRef: razorpayPaymentId,
        remarks: `Razorpay payment (Order: ${razorpayOrderId})`,
      }, req.user!.id);

      sendSuccess(res, {
        payment: receiptNumber,
        razorpayPaymentId,
        razorpayOrderId,
      }, 'Payment verified and recorded successfully');
    } catch (e) {
      next(e);
    }
  }

  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
      
      if (!webhookSecret) {
        logger.warn('Razorpay webhook secret not configured');
        return res.status(200).send('Webhook received but not processed (no secret)');
      }

      // Verify webhook signature
      const signature = req.headers['x-razorpay-signature'] as string;
      const body = JSON.stringify(req.body);
      
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        logger.warn('Invalid Razorpay webhook signature');
        return res.status(400).send('Invalid signature');
      }

      const event = req.body.event;
      const payload = req.body.payload;

      logger.info({ event }, 'Razorpay webhook received');

      switch (event) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        case 'refund.created':
          await this.handleRefundCreated(payload);
          break;
        default:
          logger.info({ event }, 'Unhandled Razorpay webhook event');
      }

      res.status(200).send('OK');
    } catch (e) {
      logger.error({ err: e }, 'Error processing Razorpay webhook');
      next(e);
    }
  }

  private async handlePaymentCaptured(payload: any) {
    const payment = payload.payment?.entity;
    if (!payment) return;

    const invoiceId = payment.notes?.invoiceId;
    const tenantId = payment.notes?.tenantId;

    if (!invoiceId || !tenantId) {
      logger.warn({ paymentId: payment.id }, 'Missing invoiceId or tenantId in payment notes');
      return;
    }

    // Check if payment already recorded
    const existingPayment = await feeService.getPaymentByTransactionRef(tenantId, payment.id);
    if (existingPayment) {
      logger.info({ paymentId: payment.id }, 'Payment already recorded, skipping');
      return;
    }

    const invoice = await feeService.getInvoice(tenantId, invoiceId);
    if (!invoice) {
      logger.warn({ invoiceId }, 'Invoice not found for webhook payment');
      return;
    }

    const amount = Math.round(Number(payment.amount) / 100);
    const outstandingAmount = Number(invoice.outstandingAmount);

    if (amount > outstandingAmount) {
      logger.warn({ paymentId: payment.id, amount, outstandingAmount }, 'Payment amount exceeds outstanding');
      return;
    }

    try {
      await feeService.recordPayment(tenantId, {
        invoiceId: invoice.id,
        amount,
        paymentMethod: 'online',
        transactionRef: payment.id,
        remarks: `Razorpay webhook (Order: ${payment.order_id})`,
      }, 'system');
      
      logger.info({ paymentId: payment.id, invoiceId }, 'Payment recorded via webhook');
    } catch (err) {
      logger.error({ err, paymentId: payment.id }, 'Failed to record payment from webhook');
    }
  }

  private async handlePaymentFailed(payload: any) {
    const payment = payload.payment?.entity;
    if (!payment) return;

    logger.info({ paymentId: payment.id, error: payment.error_description }, 'Payment failed');
    // Could add notification here if needed
  }

  private async handleRefundCreated(payload: any) {
    const refund = payload.refund?.entity;
    if (!refund) return;

    logger.info({ refundId: refund.id, paymentId: refund.payment_id }, 'Refund processed');
    // Could add notification here if needed
  }
}

export const razorpayController = new RazorpayController();