import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service.js';
import { sendSuccess } from '../../utils/response.js';

export class ReportController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getDashboardAnalytics(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }

  async getAttendanceReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getAttendanceReport(req.user!.tenantId, req.query as any)); } catch (e) { next(e); }
  }

  async getFeeReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getFeeReport(req.user!.tenantId, req.query as any)); } catch (e) { next(e); }
  }

  async getRevenueReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getRevenueReport(req.user!.tenantId, Number(req.query.year) || new Date().getFullYear())); } catch (e) { next(e); }
  }

  async getStudentReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getStudentReport(req.user!.tenantId, req.query.branchId as string || req.user!.branchId || '', req.query as any)); } catch (e) { next(e); }
  }

  async getTeacherReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getTeacherReport(req.user!.tenantId, req.query.branchId as string || req.user!.branchId || '')); } catch (e) { next(e); }
  }

  async getExamResultsReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.getExamResultsReport(req.user!.tenantId, req.query.sessionId as string, req.query.classId as string)); } catch (e) { next(e); }
  }

  async exportReport(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await reportService.generateExport(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
}

export const reportController = new ReportController();
