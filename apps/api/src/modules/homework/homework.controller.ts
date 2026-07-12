import { Request, Response, NextFunction } from 'express';
import { homeworkService } from './homework.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class HomeworkController {
  async list(req: Request, res: Response, next: NextFunction) {
    try { const r = await homeworkService.list(req.user!.tenantId, req.query as any); sendList(res, r.data, r.meta); } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.getById(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // teacherId from query or user context
      const teacherId = req.query.teacherId as string || req.user!.id;
      sendCreated(res, await homeworkService.create(req.user!.tenantId, teacherId, req.body, req.user!.id));
    } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.update(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.delete(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async publish(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.publish(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async close(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.close(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Submissions
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.query.studentId as string || req.user!.id;
      sendSuccess(res, await homeworkService.submit(req.user!.tenantId, req.params.id!, studentId, req.body));
    } catch (e) { next(e); }
  }
  async review(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.review(req.user!.tenantId, req.params.submissionId!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async getSubmissions(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.getSubmissions(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async getStudentSubmissions(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await homeworkService.getStudentSubmissions(req.user!.tenantId, req.params.studentId!)); } catch (e) { next(e); }
  }
}

export const homeworkController = new HomeworkController();
