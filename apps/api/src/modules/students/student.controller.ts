import { Request, Response, NextFunction } from 'express';
import { studentService } from './student.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class StudentController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const result = await studentService.list(req.user!.tenantId, branchId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (e) { next(e); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getById(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }

  async admit(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      sendCreated(res, await studentService.admit(req.user!.tenantId, branchId, req.body, req.user!.id), 'Student admitted');
    } catch (e) { next(e); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.update(req.user!.tenantId, req.params.id!, req.body, req.user!.id), 'Student updated'); } catch (e) { next(e); }
  }

  async archive(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.archive(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Parents
  async getParents(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getParents(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async addParent(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await studentService.addParent(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async removeParent(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.removeParent(req.user!.tenantId, req.params.id!, req.params.parentId!, req.user!.id)); } catch (e) { next(e); }
  }

  // Documents
  async getDocuments(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getDocuments(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async addDocument(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await studentService.addDocument(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.deleteDocument(req.user!.tenantId, req.params.id!, req.params.docId!, req.user!.id)); } catch (e) { next(e); }
  }
  async verifyDocument(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.verifyDocument(req.user!.tenantId, req.params.id!, req.params.docId!, req.user!.id)); } catch (e) { next(e); }
  }

  // Promotion & Transfer
  async promote(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.promote(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async transfer(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.transfer(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Certificates & Timeline
  async getCertificates(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getCertificates(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async getTimeline(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getTimeline(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }

  // Bulk & Stats
  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string;
      const sessionId = req.query.sessionId as string;
      sendSuccess(res, await studentService.bulkImport(req.user!.tenantId, branchId, req.body, sessionId, req.user!.id));
    } catch (e) { next(e); }
  }
  async exportStudents(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.exportStudents(req.user!.tenantId, req.query.branchId as string, req.query.classId as string)); } catch (e) { next(e); }
  }
  async getStats(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await studentService.getStats(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }
}

export const studentController = new StudentController();
