import { Request, Response, NextFunction } from 'express';
import { teacherService } from './teacher.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class TeacherController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const result = await teacherService.list(req.user!.tenantId, branchId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getById(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      sendCreated(res, await teacherService.create(req.user!.tenantId, branchId, req.body, req.user!.id), 'Teacher created');
    } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.update(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async archive(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.archive(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Qualifications
  async getQualifications(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getQualifications(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async addQualification(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await teacherService.addQualification(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteQualification(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.deleteQualification(req.user!.tenantId, req.params.id!, req.params.qId!, req.user!.id)); } catch (e) { next(e); }
  }

  // Experience
  async getExperiences(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getExperiences(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async addExperience(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await teacherService.addExperience(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteExperience(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.deleteExperience(req.user!.tenantId, req.params.id!, req.params.expId!, req.user!.id)); } catch (e) { next(e); }
  }

  // Salary
  async getSalary(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getSalary(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async updateSalary(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.updateSalary(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Subjects
  async getSubjects(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getSubjects(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async assignSubjects(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.assignSubjects(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Documents
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getDocuments(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async addDocument(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await teacherService.addDocument(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.deleteDocument(req.user!.tenantId, req.params.id!, req.params.docId!, req.user!.id)); } catch (e) { next(e); }
  }

  // Timetable & Attendance
  async getTimetable(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getTimetable(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async getAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();
      sendSuccess(res, await teacherService.getAttendanceSummary(req.user!.tenantId, req.params.id!, month, year));
    } catch (e) { next(e); }
  }
  async getLeaves(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getLeaves(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async getLeaveStats(req: Request, res: Response, next: NextFunction) {
    try {
      const year = Number(req.query.year) || new Date().getFullYear();
      sendSuccess(res, await teacherService.getLeaveStats(req.user!.tenantId, req.params.id!, year));
    } catch (e) { next(e); }
  }

  // Timeline
  async getTimeline(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await teacherService.getTimeline(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
}

export const teacherController = new TeacherController();
