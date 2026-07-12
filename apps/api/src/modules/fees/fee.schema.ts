import { z } from 'zod';

// ─── Fee Category ───
export const createFeeCategorySchema = z.object({
  name: z.string().min(1).max(100).trim(),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_]+$/),
  description: z.string().max(300).optional(),
});
export const updateFeeCategorySchema = createFeeCategorySchema.partial();

// ─── Fee Structure ───
export const createFeeStructureSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  academicSessionId: z.string().min(1),
  classId: z.string().optional(),
  feeCategoryId: z.string().min(1),
  amount: z.number().min(0),
  dueDate: z.string().datetime().optional(),
  frequency: z.enum(['one_time', 'monthly', 'quarterly', 'half_yearly', 'annual']).default('annual'),
});
export const updateFeeStructureSchema = createFeeStructureSchema.partial();

// ─── Fine Rules ───
export const createFineRuleSchema = z.object({
  feeCategoryId: z.string().optional(),
  name: z.string().min(1).max(100),
  type: z.enum(['fixed', 'percentage', 'per_day']),
  value: z.number().min(0),
  gracePeriodDays: z.number().int().min(0).default(0),
  maxAmount: z.number().min(0).optional(),
});

// ─── Invoice ───
export const generateInvoiceSchema = z.object({
  studentId: z.string().min(1),
  feeStructureId: z.string().min(1),
  dueDate: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});

export const generateBulkInvoicesSchema = z.object({
  feeStructureId: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

// ─── Payment ───
export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.number().min(0.01),
  paymentMethod: z.enum(['cash', 'online', 'cheque', 'bank_transfer', 'upi', 'card', 'demand_draft']),
  transactionRef: z.string().max(100).optional(),
  remarks: z.string().max(300).optional(),
  paidAt: z.string().datetime().optional(),
});

// ─── Discount ───
export const applyDiscountSchema = z.object({
  invoiceId: z.string().min(1),
  name: z.string().min(1).max(100),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(0),
  reason: z.string().max(300).optional(),
});

// ─── Scholarship ───
export const applyScholarshipSchema = z.object({
  invoiceId: z.string().min(1),
  name: z.string().min(1).max(100),
  amount: z.number().min(0),
});

// ─── Refund ───
export const processRefundSchema = z.object({
  paymentId: z.string().min(1),
  amount: z.number().min(0.01),
  reason: z.string().min(1).max(500),
});

// ─── Queries ───
export const feeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['draft', 'issued', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded']).optional(),
  classId: z.string().optional(),
  studentId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CreateFeeCategoryInput = z.infer<typeof createFeeCategorySchema>;
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export type CreateFineRuleInput = z.infer<typeof createFineRuleSchema>;
export type GenerateInvoiceInput = z.infer<typeof generateInvoiceSchema>;
export type GenerateBulkInvoicesInput = z.infer<typeof generateBulkInvoicesSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
export type ApplyDiscountInput = z.infer<typeof applyDiscountSchema>;
export type ApplyScholarshipInput = z.infer<typeof applyScholarshipSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type FeeListQuery = z.infer<typeof feeListQuerySchema>;
