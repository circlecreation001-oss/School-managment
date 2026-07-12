import { Request, Response, NextFunction } from 'express';
import { feeService } from './fee.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class FeeController {
  // Categories
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.listCategories(req.user!.tenantId)); } catch (e) { next(e); }
  }
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.createCategory(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.updateCategory(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.deleteCategory(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Structures
  async listStructures(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.listStructures(req.user!.tenantId, req.query.branchId as string || req.user!.branchId || '', req.query.sessionId as string)); } catch (e) { next(e); }
  }
  async getStructure(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getStructure(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async createStructure(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.createStructure(req.user!.tenantId, req.query.branchId as string || req.user!.branchId || '', req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Invoices
  async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feeService.listInvoices(req.user!.tenantId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (e) { next(e); }
  }
  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getInvoice(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async generateInvoice(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.generateInvoice(req.user!.tenantId, req.body, req.user!.id), 'Invoice generated'); } catch (e) { next(e); }
  }
  async generateBulkInvoices(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.generateBulkInvoices(req.user!.tenantId, req.query.branchId as string || req.user!.branchId || '', req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Payments
  async recordPayment(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.recordPayment(req.user!.tenantId, req.body, req.user!.id), 'Payment recorded'); } catch (e) { next(e); }
  }

  // Discounts & Scholarships
  async applyDiscount(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.applyDiscount(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async applyScholarship(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await feeService.applyScholarship(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Refund
  async processRefund(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.processRefund(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Reports
  async getDueReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getDueReport(req.user!.tenantId, req.query.classId as string)); } catch (e) { next(e); }
  }
  async getCollectionSummary(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getCollectionSummary(req.user!.tenantId, req.query.startDate as string, req.query.endDate as string)); } catch (e) { next(e); }
  }
  async getRevenueByMonth(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getRevenueByMonth(req.user!.tenantId, Number(req.query.year) || new Date().getFullYear())); } catch (e) { next(e); }
  }
  async getStudentLedger(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await feeService.getStudentLedger(req.user!.tenantId, req.params.studentId!)); } catch (e) { next(e); }
  }
}

export const feeController = new FeeController();
