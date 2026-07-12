import { Request, Response, NextFunction } from 'express';
import { organizationService } from './organization.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class OrganizationController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20, search, status, sortBy, sortOrder } = req.query;
      const result = await organizationService.list({
        page: Number(page), limit: Number(limit),
        search: search as string, status: status as string,
        sortBy: sortBy as string, sortOrder: sortOrder as 'asc' | 'desc',
      });
      sendList(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getById(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.create(req.body, req.user!.id);
      sendCreated(res, result, 'Organization created successfully');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.update(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'Organization updated');
    } catch (err) { next(err); }
  }

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.suspend(req.params.id!, req.user!.id);
      sendSuccess(res, result, 'Organization suspended');
    } catch (err) { next(err); }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.activate(req.params.id!, req.user!.id);
      sendSuccess(res, result, 'Organization activated');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.delete(req.params.id!, req.user!.id);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }

  // ─── Branding ───
  async getBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getBranding(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async updateBranding(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateBranding(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'Branding updated');
    } catch (err) { next(err); }
  }

  // ─── Subscription ───
  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getSubscription(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async assignSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.assignSubscription(req.params.id!, req.body, req.user!.id);
      sendCreated(res, result, 'Subscription assigned');
    } catch (err) { next(err); }
  }

  async renewSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { months } = req.body;
      const result = await organizationService.renewSubscription(req.params.id!, months || 12, req.user!.id);
      sendSuccess(res, result, 'Subscription renewed');
    } catch (err) { next(err); }
  }

  // ─── Config ───
  async getConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const { module } = req.query;
      const result = await organizationService.getConfigs(req.params.id!, module as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async updateConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateConfigs(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'Configuration updated');
    } catch (err) { next(err); }
  }

  // ─── Features ───
  async getFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getFeatures(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async updateFeatures(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.updateFeatures(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'Features updated');
    } catch (err) { next(err); }
  }

  // ─── Admins ───
  async getAdmins(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getAdmins(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async createAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createAdmin(req.params.id!, req.body, req.user!.id);
      sendCreated(res, result, 'Organization admin created');
    } catch (err) { next(err); }
  }

  // ─── Plans ───
  async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.listPlans();
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.createPlan(req.body, req.user!.id);
      sendCreated(res, result, 'Plan created');
    } catch (err) { next(err); }
  }

  // ─── Usage ───
  async getUsage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getUsage(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  // ─── Setup Wizard ───
  async getSetupStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.getSetupStatus(req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async completeSetup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await organizationService.completeSetup(req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }
}

export const organizationController = new OrganizationController();
