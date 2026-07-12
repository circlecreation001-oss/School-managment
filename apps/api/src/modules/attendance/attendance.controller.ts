import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export class AttendanceController {
  // ─── Mark ───
  async markBulkStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.markBulkStudentAttendance(req.user!.tenantId, branchId, req.body, req.user!.id);
      sendSuccess(res, r, `Marked ${r.marked} records`);
    } catch (e) { next(e); }
  }

  async markSingleStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.markSingleStudent(req.user!.tenantId, branchId, req.params.studentId!, req.body, req.user!.id);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async markTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.markTeacherAttendance(req.user!.tenantId, branchId, req.body, req.user!.id);
      sendSuccess(res, r, `Marked ${r.marked} records`);
    } catch (e) { next(e); }
  }

  async markStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.markStaffAttendance(req.user!.tenantId, branchId, req.body, req.user!.id);
      sendSuccess(res, r, `Marked ${r.marked} records`);
    } catch (e) { next(e); }
  }

  async qrCheckIn(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.qrCheckIn(req.user!.tenantId, branchId, req.body, req.user!.id);
      sendSuccess(res, r, 'Check-in recorded');
    } catch (e) { next(e); }
  }

  // ─── Query ───
  async getDailyStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getDailyStudentAttendance(req.user!.tenantId, branchId, req.query as any);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getDailyTeacher(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getDailyTeacherAttendance(req.user!.tenantId, branchId, req.query.date as string);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getDailyStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getDailyStaffAttendance(req.user!.tenantId, branchId, req.query.date as string);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getMonthlyReport(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getMonthlyReport(req.user!.tenantId, branchId, req.query as any);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getAnalytics(req.user!.tenantId, branchId, req.query as any);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getAbsentees(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getAbsentees(req.user!.tenantId, branchId, req.query.date as string, req.query.classId as string);
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }

  async getHolidays(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const r = await attendanceService.getHolidays(req.user!.tenantId, branchId, Number(req.query.month), Number(req.query.year));
      sendSuccess(res, r);
    } catch (e) { next(e); }
  }
}

export const attendanceController = new AttendanceController();
