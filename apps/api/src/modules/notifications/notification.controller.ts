import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class NotificationController {
  // Send
  async send(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.send(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async sendFromTemplate(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.sendFromTemplate(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      sendSuccess(res, await notificationService.broadcast(req.user!.tenantId, branchId, req.body, req.user!.id));
    } catch (e) { next(e); }
  }
  async schedule(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.schedule(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // User notifications
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.getUserNotifications(req.user!.id)); } catch (e) { next(e); }
  }
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, { count: await notificationService.getUnreadCount(req.user!.id) }); } catch (e) { next(e); }
  }
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.markAsRead(req.user!.id, req.params.id!)); } catch (e) { next(e); }
  }
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.markAllAsRead(req.user!.id)); } catch (e) { next(e); }
  }

  // Admin
  async listAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await notificationService.listAll(req.user!.tenantId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (e) { next(e); }
  }
  async getDeliveryStats(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.getDeliveryStats(req.user!.tenantId, req.query.startDate as string, req.query.endDate as string)); } catch (e) { next(e); }
  }

  // Templates
  async listTemplates(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.listTemplates(req.user!.tenantId, req.query.channel as string)); } catch (e) { next(e); }
  }
  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await notificationService.createTemplate(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.updateTemplate(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await notificationService.deleteTemplate(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
}

export const notificationController = new NotificationController();
