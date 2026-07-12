import { Request, Response, NextFunction } from 'express';
import { superAdminService } from './super-admin.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class SuperAdminController {
  // ─── DASHBOARD ───
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.getDashboard();
      sendSuccess(res, result, 'Dashboard data fetched');
    } catch (err) { next(err); }
  }

  // ─── TENANTS ───
  async listTenants(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, status, sortBy, sortOrder } = req.query;
      const result = await superAdminService.listTenants({
        page: Number(page), limit: Number(limit),
        search: search as string, status: status as string,
        sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc',
      });
      sendList(res, result.data, result.meta, 'Organizations fetched');
    } catch (err) { next(err); }
  }

  async getTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.getTenant(req.params.id!);
      sendSuccess(res, result, 'Organization fetched');
    } catch (err) { next(err); }
  }

  async createTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.createTenant(req.body, req.user!.id);
      sendCreated(res, result, 'Organization created');
    } catch (err) { next(err); }
  }

  async updateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.updateTenant(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'Organization updated');
    } catch (err) { next(err); }
  }

  async suspendTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.suspendTenant(req.params.id!, req.user!.id);
      sendSuccess(res, result, 'Organization suspended');
    } catch (err) { next(err); }
  }

  async activateTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.activateTenant(req.params.id!, req.user!.id);
      sendSuccess(res, result, 'Organization activated');
    } catch (err) { next(err); }
  }

  async deleteTenant(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.deleteTenant(req.params.id!, req.user!.id);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }

  async updateBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.updateBranding(req.params.id!, req.body);
      sendSuccess(res, result, 'Branding updated');
    } catch (err) { next(err); }
  }

  async updateFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.updateFeatureFlags(req.params.id!, req.body);
      sendSuccess(res, result, 'Features updated');
    } catch (err) { next(err); }
  }

  // ─── USERS ───
  async listUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, status, tenantId, sortBy, sortOrder } = req.query;
      const result = await superAdminService.listUsers({
        page: Number(page), limit: Number(limit),
        search: search as string, status: status as string,
        tenantId: tenantId as string,
        sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc',
      });
      sendList(res, result.data, result.meta, 'Users fetched');
    } catch (err) { next(err); }
  }

  async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.updateUserStatus(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async forceLogoutUser(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.forceLogoutUser(req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async resetUserPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.resetUserPassword(req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  // ─── AUDIT LOGS ───
  async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 50, tenantId, action, entityType, startDate, endDate } = req.query;
      const result = await superAdminService.listAuditLogs({
        page: Number(page), limit: Number(limit),
        tenantId: tenantId as string, action: action as string,
        entityType: entityType as string,
        startDate: startDate as string, endDate: endDate as string,
      });
      sendList(res, result.data, result.meta, 'Audit logs fetched');
    } catch (err) { next(err); }
  }

  // ─── ANNOUNCEMENTS ───
  async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await superAdminService.createAnnouncement(req.body, req.user!.id);
      sendCreated(res, result, result.message);
    } catch (err) { next(err); }
  }
}

export const superAdminController = new SuperAdminController();
