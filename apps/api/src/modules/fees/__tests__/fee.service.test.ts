import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeeService } from '../fee.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() }, student: { findMany: vi.fn().mockResolvedValue([{ id: 's1' }]) } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  listCategories: vi.fn().mockResolvedValue([]),
  createCategory: vi.fn().mockResolvedValue({ id: 'fc1', name: 'Tuition' }),
  updateCategory: vi.fn().mockResolvedValue({ id: 'fc1' }),
  deleteCategory: vi.fn(),
  listStructures: vi.fn().mockResolvedValue([]),
  getStructure: vi.fn().mockResolvedValue({ id: 'fs1', tenantId: 't1', amount: 5000, dueDate: null }),
  createStructure: vi.fn().mockResolvedValue({ id: 'fs1' }),
  listInvoices: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getInvoice: vi.fn(),
  createInvoice: vi.fn().mockResolvedValue({ id: 'inv1', invoiceNumber: 'INV25000001' }),
  updateInvoice: vi.fn(),
  getNextInvoiceNumber: vi.fn().mockResolvedValue('INV25000001'),
  createPayment: vi.fn().mockResolvedValue({ id: 'pay1', receiptNumber: 'RCT25000001' }),
  getPayment: vi.fn(),
  getNextReceiptNumber: vi.fn().mockResolvedValue('RCT25000001'),
  updatePaymentStatus: vi.fn(),
  applyDiscount: vi.fn().mockResolvedValue({ id: 'disc1' }),
  applyScholarship: vi.fn().mockResolvedValue({ id: 'sch1' }),
  getDueReport: vi.fn().mockResolvedValue([]),
  getCollectionSummary: vi.fn().mockResolvedValue({ totalCollected: 50000, paymentCount: 10, byMethod: {} }),
  getRevenueByMonth: vi.fn().mockResolvedValue([]),
  getStudentLedger: vi.fn().mockResolvedValue([]),
};
vi.mock('../fee.repository.js', () => ({ feeRepository: mockRepo }));

describe('FeeService', () => {
  let service: FeeService;
  beforeEach(() => { service = new FeeService(); vi.clearAllMocks(); });

  it('generates an invoice', async () => {
    const r = await service.generateInvoice('t1', { studentId: 's1', feeStructureId: 'fs1' }, 'actor');
    expect(r.invoiceNumber).toBe('INV25000001');
  });

  it('records a payment and updates invoice', async () => {
    mockRepo.getInvoice.mockResolvedValue({ id: 'inv1', tenantId: 't1', totalAmount: 5000, paidAmount: 0, outstandingAmount: 5000, status: 'issued' });
    const r = await service.recordPayment('t1', { invoiceId: 'inv1', amount: 3000, paymentMethod: 'cash' }, 'actor');
    expect(r.id).toBe('pay1');
    expect(mockRepo.updateInvoice).toHaveBeenCalledWith('inv1', expect.objectContaining({ paidAmount: 3000 }));
  });

  it('rejects payment exceeding outstanding', async () => {
    mockRepo.getInvoice.mockResolvedValue({ id: 'inv1', tenantId: 't1', totalAmount: 5000, paidAmount: 4000, outstandingAmount: 1000, status: 'partially_paid' });
    await expect(service.recordPayment('t1', { invoiceId: 'inv1', amount: 2000, paymentMethod: 'cash' }, 'actor')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('applies percentage discount', async () => {
    mockRepo.getInvoice.mockResolvedValue({ id: 'inv1', tenantId: 't1', totalAmount: 10000, outstandingAmount: 10000 });
    await service.applyDiscount('t1', { invoiceId: 'inv1', name: '10% off', type: 'percentage', value: 10 }, 'actor');
    expect(mockRepo.updateInvoice).toHaveBeenCalledWith('inv1', { outstandingAmount: 9000 });
  });
});

