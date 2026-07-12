import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { feeRepository } from './fee.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  CreateFeeCategoryInput, CreateFeeStructureInput, GenerateInvoiceInput,
  GenerateBulkInvoicesInput, RecordPaymentInput, ApplyDiscountInput,
  ApplyScholarshipInput, ProcessRefundInput, FeeListQuery,
} from './fee.schema.js';

export class FeeService {
  // ─── CATEGORIES ───
  async listCategories(tenantId: string) { return feeRepository.listCategories(tenantId); }
  async createCategory(tenantId: string, input: CreateFeeCategoryInput, actorId: string) {
    const cat = await feeRepository.createCategory({ tenantId, ...input });
    await this.audit(tenantId, actorId, 'fee_category', cat.id, 'create');
    return cat;
  }
  async updateCategory(tenantId: string, id: string, input: Partial<CreateFeeCategoryInput>, actorId: string) {
    const cat = await feeRepository.updateCategory(id, input);
    await this.audit(tenantId, actorId, 'fee_category', id, 'update');
    return cat;
  }
  async deleteCategory(tenantId: string, id: string, actorId: string) {
    await feeRepository.deleteCategory(id);
    await this.audit(tenantId, actorId, 'fee_category', id, 'delete');
    return { message: 'Fee category deleted' };
  }

  // ─── STRUCTURES ───
  async listStructures(tenantId: string, branchId: string, sessionId?: string) {
    return feeRepository.listStructures(tenantId, branchId, sessionId);
  }
  async getStructure(tenantId: string, id: string) {
    const s = await feeRepository.getStructure(id);
    if (!s || s.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Fee structure not found');
    return s;
  }
  async createStructure(tenantId: string, branchId: string, input: CreateFeeStructureInput, actorId: string) {
    const structure = await feeRepository.createStructure({ tenantId, branchId, ...input, amount: input.amount });
    await this.audit(tenantId, actorId, 'fee_structure', structure.id, 'create');
    return structure;
  }

  // ─── INVOICES ───
  async listInvoices(tenantId: string, query: FeeListQuery) {
    const { data, total } = await feeRepository.listInvoices(tenantId, {
      ...query, startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    });
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  async getInvoice(tenantId: string, id: string) {
    const inv = await feeRepository.getInvoice(id);
    if (!inv || inv.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
    return inv;
  }

  async generateInvoice(tenantId: string, input: GenerateInvoiceInput, actorId: string) {
    const structure = await feeRepository.getStructure(input.feeStructureId);
    if (!structure) throw new AppError(404, 'NOT_FOUND', 'Fee structure not found');

    const invoiceNumber = await feeRepository.getNextInvoiceNumber(tenantId);
    const totalAmount = Number(structure.amount);

    const invoice = await feeRepository.createInvoice({
      tenantId, studentId: input.studentId, feeStructureId: input.feeStructureId,
      invoiceNumber, totalAmount, outstandingAmount: totalAmount, paidAmount: 0,
      dueDate: input.dueDate ? new Date(input.dueDate) : structure.dueDate,
      status: 'issued',
    });

    await this.audit(tenantId, actorId, 'invoice', invoice.id, 'generate');
    return invoice;
  }

  async generateBulkInvoices(tenantId: string, branchId: string, input: GenerateBulkInvoicesInput, actorId: string) {
    const structure = await feeRepository.getStructure(input.feeStructureId);
    if (!structure) throw new AppError(404, 'NOT_FOUND', 'Fee structure not found');

    const where: any = { tenantId, branchId, classId: input.classId, status: 'active', deletedAt: null };
    if (input.sectionId) where.sectionId = input.sectionId;
    const students = await prisma.student.findMany({ where, select: { id: true } });

    let generated = 0;
    for (const student of students) {
      const invoiceNumber = await feeRepository.getNextInvoiceNumber(tenantId);
      const totalAmount = Number(structure.amount);
      await feeRepository.createInvoice({
        tenantId, studentId: student.id, feeStructureId: input.feeStructureId,
        invoiceNumber, totalAmount, outstandingAmount: totalAmount, paidAmount: 0,
        dueDate: input.dueDate ? new Date(input.dueDate) : structure.dueDate, status: 'issued',
      });
      generated++;
    }

    await this.audit(tenantId, actorId, 'invoice', null, 'bulk_generate', { count: generated, classId: input.classId });
    logger.info({ tenantId, generated, actorId }, 'Bulk invoices generated');
    return { generated, classId: input.classId };
  }

  // ─── PAYMENTS ───
  async recordPayment(tenantId: string, input: RecordPaymentInput, actorId: string) {
    const invoice = await feeRepository.getInvoice(input.invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');
    if (invoice.status === 'paid') throw new AppError(400, 'BAD_REQUEST', 'Invoice is already fully paid');
    if (input.amount > Number(invoice.outstandingAmount)) throw new AppError(400, 'BAD_REQUEST', 'Payment exceeds outstanding amount');

    const receiptNumber = await feeRepository.getNextReceiptNumber(tenantId);

    const payment = await feeRepository.createPayment({
      tenantId, invoiceId: input.invoiceId, amount: input.amount,
      paymentMethod: input.paymentMethod as any,
      transactionRef: input.transactionRef, receiptNumber,
      status: 'completed', paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
      remarks: input.remarks,
    });

    // Update invoice
    const newPaid = Number(invoice.paidAmount) + input.amount;
    const newOutstanding = Number(invoice.totalAmount) - newPaid;
    const newStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';

    await feeRepository.updateInvoice(input.invoiceId, {
      paidAmount: newPaid, outstandingAmount: Math.max(0, newOutstanding), status: newStatus,
    });

    await this.audit(tenantId, actorId, 'payment', payment.id, 'record', { amount: input.amount, method: input.paymentMethod });
    logger.info({ tenantId, paymentId: payment.id, amount: input.amount, actorId }, 'Payment recorded');
    return payment;
  }

  // ─── DISCOUNTS ───
  async applyDiscount(tenantId: string, input: ApplyDiscountInput, actorId: string) {
    const invoice = await feeRepository.getInvoice(input.invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');

    const discountAmount = input.type === 'percentage'
      ? (Number(invoice.totalAmount) * input.value) / 100
      : input.value;

    const discount = await feeRepository.applyDiscount({
      tenantId, invoiceId: input.invoiceId, name: input.name,
      type: input.type, value: input.value, amount: discountAmount,
      reason: input.reason, approvedBy: actorId,
    });

    // Update outstanding
    const newOutstanding = Math.max(0, Number(invoice.outstandingAmount) - discountAmount);
    await feeRepository.updateInvoice(input.invoiceId, { outstandingAmount: newOutstanding });

    await this.audit(tenantId, actorId, 'discount', discount.id, 'apply', { amount: discountAmount });
    return discount;
  }

  // ─── SCHOLARSHIPS ───
  async applyScholarship(tenantId: string, input: ApplyScholarshipInput, actorId: string) {
    const invoice = await feeRepository.getInvoice(input.invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Invoice not found');

    const scholarship = await feeRepository.applyScholarship({
      tenantId, invoiceId: input.invoiceId, name: input.name,
      amount: input.amount, status: 'approved', approvedBy: actorId,
    });

    const newOutstanding = Math.max(0, Number(invoice.outstandingAmount) - input.amount);
    await feeRepository.updateInvoice(input.invoiceId, { outstandingAmount: newOutstanding });

    await this.audit(tenantId, actorId, 'scholarship', scholarship.id, 'apply', { amount: input.amount });
    return scholarship;
  }

  // ─── REFUND ───
  async processRefund(tenantId: string, input: ProcessRefundInput, actorId: string) {
    const payment = await feeRepository.getPayment(input.paymentId);
    if (!payment || payment.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Payment not found');
    if (Number(payment.amount) < input.amount) throw new AppError(400, 'BAD_REQUEST', 'Refund exceeds payment amount');

    await feeRepository.updatePaymentStatus(input.paymentId, 'refunded');

    // Update invoice outstanding
    const invoice = payment.invoice;
    if (invoice) {
      const newOutstanding = Number(invoice.outstandingAmount) + input.amount;
      const newPaid = Math.max(0, Number(invoice.paidAmount) - input.amount);
      await feeRepository.updateInvoice(invoice.id, { outstandingAmount: newOutstanding, paidAmount: newPaid, status: 'refunded' });
    }

    await this.audit(tenantId, actorId, 'payment', input.paymentId, 'refund', { amount: input.amount, reason: input.reason });
    return { message: 'Refund processed' };
  }

  // ─── REPORTS ───
  async getDueReport(tenantId: string, classId?: string) { return feeRepository.getDueReport(tenantId, classId); }

  async getCollectionSummary(tenantId: string, startDate: string, endDate: string) {
    return feeRepository.getCollectionSummary(tenantId, new Date(startDate), new Date(endDate));
  }

  async getRevenueByMonth(tenantId: string, year: number) { return feeRepository.getRevenueByMonth(tenantId, year); }

  async getStudentLedger(tenantId: string, studentId: string) { return feeRepository.getStudentLedger(tenantId, studentId); }

  // ─── PRIVATE ───
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: metadata || undefined } });
  }
}

export const feeService = new FeeService();
