import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class FeeRepository {
  // ─── Fee Categories ───
  async listCategories(tenantId: string) {
    return prisma.feeCategory.findMany({ where: { tenantId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
  async createCategory(data: Prisma.FeeCategoryUncheckedCreateInput) { return prisma.feeCategory.create({ data }); }
  async updateCategory(id: string, data: Prisma.FeeCategoryUpdateInput) { return prisma.feeCategory.update({ where: { id }, data }); }
  async deleteCategory(id: string) { return prisma.feeCategory.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Fee Structures ───
  async listStructures(tenantId: string, branchId: string, sessionId?: string) {
    const where: Prisma.FeeStructureWhereInput = { tenantId, branchId, deletedAt: null };
    if (sessionId) where.academicSessionId = sessionId;
    return prisma.feeStructure.findMany({
      where, include: { feeCategory: { select: { name: true, code: true } }, class: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
  async getStructure(id: string) { return prisma.feeStructure.findUnique({ where: { id }, include: { feeCategory: true, class: true } }); }
  async createStructure(data: Prisma.FeeStructureUncheckedCreateInput) { return prisma.feeStructure.create({ data }); }
  async updateStructure(id: string, data: Prisma.FeeStructureUpdateInput) { return prisma.feeStructure.update({ where: { id }, data }); }
  async deleteStructure(id: string) { return prisma.feeStructure.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Invoices ───
  async listInvoices(tenantId: string, params: {
    page: number; limit: number; status?: string; classId?: string;
    studentId?: string; startDate?: Date; endDate?: Date;
  }) {
    const where: Prisma.InvoiceWhereInput = { tenantId, deletedAt: null };
    if (params.status) where.status = params.status as any;
    if (params.studentId) where.studentId = params.studentId;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [data, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true } } } },
          feeStructure: { select: { name: true }, },
          payments: { select: { id: true, amount: true, status: true, paidAt: true, paymentMethod: true } },
        },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.invoice.count({ where }),
    ]);
    return { data, total };
  }

  async getInvoice(id: string) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
        feeStructure: { include: { feeCategory: true } },
        payments: true, discounts: true, scholarships: true,
      },
    });
  }

  async createInvoice(data: Prisma.InvoiceUncheckedCreateInput) { return prisma.invoice.create({ data }); }
  async updateInvoice(id: string, data: Prisma.InvoiceUpdateInput) { return prisma.invoice.update({ where: { id }, data }); }

  async getNextInvoiceNumber(tenantId: string): Promise<string> {
    const count = await prisma.invoice.count({ where: { tenantId } });
    const year = new Date().getFullYear().toString().slice(-2);
    return `INV${year}${String(count + 1).padStart(6, '0')}`;
  }

  // ─── Payments ───
  async createPayment(data: Prisma.PaymentUncheckedCreateInput) { return prisma.payment.create({ data }); }
  async getPayment(id: string) { return prisma.payment.findUnique({ where: { id }, include: { invoice: true } }); }
  async getNextReceiptNumber(tenantId: string): Promise<string> {
    const count = await prisma.payment.count({ where: { tenantId } });
    const year = new Date().getFullYear().toString().slice(-2);
    return `RCT${year}${String(count + 1).padStart(6, '0')}`;
  }
  async updatePaymentStatus(id: string, status: string) { return prisma.payment.update({ where: { id }, data: { status: status as any } }); }

  // ─── Discounts ───
  async applyDiscount(data: Prisma.DiscountUncheckedCreateInput) { return prisma.discount.create({ data }); }
  async getInvoiceDiscounts(invoiceId: string) { return prisma.discount.findMany({ where: { invoiceId } }); }

  // ─── Scholarships ───
  async applyScholarship(data: Prisma.ScholarshipUncheckedCreateInput) { return prisma.scholarship.create({ data }); }
  async getInvoiceScholarships(invoiceId: string) { return prisma.scholarship.findMany({ where: { invoiceId } }); }

  // ─── Reports ───
  async getDueReport(tenantId: string, classId?: string) {
    const where: Prisma.InvoiceWhereInput = {
      tenantId, deletedAt: null, status: { in: ['issued', 'partially_paid', 'overdue'] },
    };
    return prisma.invoice.findMany({
      where,
      include: { student: { select: { firstName: true, lastName: true, admissionNumber: true, class: { select: { name: true } } } } },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getCollectionSummary(tenantId: string, startDate: Date, endDate: Date) {
    const payments = await prisma.payment.findMany({
      where: { tenantId, status: 'completed', paidAt: { gte: startDate, lte: endDate } },
      select: { amount: true, paymentMethod: true, paidAt: true },
    });
    const totalCollected = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const byMethod: Record<string, number> = {};
    for (const p of payments) {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + Number(p.amount);
    }
    return { totalCollected, paymentCount: payments.length, byMethod };
  }

  async getRevenueByMonth(tenantId: string, year: number) {
    const payments = await prisma.payment.findMany({
      where: {
        tenantId, status: 'completed',
        paidAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
      },
      select: { amount: true, paidAt: true },
    });
    const monthly: Record<string, number> = {};
    for (const p of payments) {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + Number(p.amount);
      }
    }
    return Object.entries(monthly).map(([month, amount]) => ({ month, amount }));
  }

  // ─── Student Ledger ───
  async getStudentLedger(tenantId: string, studentId: string) {
    return prisma.invoice.findMany({
      where: { tenantId, studentId, deletedAt: null },
      include: { payments: true, discounts: true, scholarships: true, feeStructure: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const feeRepository = new FeeRepository();
