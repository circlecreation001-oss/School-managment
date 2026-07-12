import { Router } from 'express';
import { feeController } from './fee.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  createFeeCategorySchema, updateFeeCategorySchema, createFeeStructureSchema,
  generateInvoiceSchema, generateBulkInvoicesSchema, recordPaymentSchema,
  applyDiscountSchema, applyScholarshipSchema, processRefundSchema, feeListQuerySchema,
} from './fee.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['fees:view']);
const create = requirePermission(['fees:create']);
const edit = requirePermission(['fees:edit']);
const approve = requirePermission(['fees:approve']);

// Categories
router.get('/categories', view, feeController.listCategories);
router.post('/categories', create, validate(createFeeCategorySchema), feeController.createCategory);
router.patch('/categories/:id', edit, validate(updateFeeCategorySchema), feeController.updateCategory);
router.delete('/categories/:id', edit, feeController.deleteCategory);

// Structures
router.get('/structures', view, feeController.listStructures);
router.get('/structures/:id', view, feeController.getStructure);
router.post('/structures', create, validate(createFeeStructureSchema), feeController.createStructure);

// Invoices
router.get('/invoices', view, validateRequest({ query: feeListQuerySchema }), feeController.listInvoices);
router.get('/invoices/:id', view, feeController.getInvoice);
router.post('/invoices', create, validate(generateInvoiceSchema), feeController.generateInvoice);
router.post('/invoices/bulk', create, validate(generateBulkInvoicesSchema), feeController.generateBulkInvoices);

// Payments
router.post('/payments', create, validate(recordPaymentSchema), feeController.recordPayment);

// Discounts & Scholarships
router.post('/discounts', approve, validate(applyDiscountSchema), feeController.applyDiscount);
router.post('/scholarships', approve, validate(applyScholarshipSchema), feeController.applyScholarship);

// Refund
router.post('/refunds', approve, validate(processRefundSchema), feeController.processRefund);

// Reports
router.get('/reports/due', view, feeController.getDueReport);
router.get('/reports/collection', view, feeController.getCollectionSummary);
router.get('/reports/revenue', view, feeController.getRevenueByMonth);
router.get('/ledger/:studentId', view, feeController.getStudentLedger);

export { router as feeRouter };
