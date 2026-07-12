import { Request, Response, NextFunction } from 'express';
import { materialService } from './material.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class MaterialController {
  async list(req: Request, res: Response, next: NextFunction) {
    try { const r = await materialService.list(req.user!.tenantId, req.query as any); sendList(res, r.data, r.meta); } catch (e) { next(e); }
  }
  async getById(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await materialService.getById(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async create(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await materialService.create(req.user!.tenantId, req.query.teacherId as string || null, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async update(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await materialService.update(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async delete(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await materialService.delete(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async download(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await materialService.download(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
}

export const materialController = new MaterialController();
