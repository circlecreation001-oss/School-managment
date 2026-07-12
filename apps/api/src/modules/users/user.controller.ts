import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class UserController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user!.tenantId;
      const result = await userService.list(tenantId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getById(req.user!.tenantId, req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.create(req.user!.tenantId, req.body, req.user!.id);
      sendCreated(res, result, 'User created successfully');
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.update(req.user!.tenantId, req.params.id!, req.body, req.user!.id);
      sendSuccess(res, result, 'User updated');
    } catch (err) { next(err); }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.updateProfile(req.user!.tenantId, req.user!.id, req.body);
      sendSuccess(res, result, 'Profile updated');
    } catch (err) { next(err); }
  }

  async activate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.activate(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, result, 'User activated');
    } catch (err) { next(err); }
  }

  async suspend(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.suspend(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, result, 'User suspended');
    } catch (err) { next(err); }
  }

  async archive(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.archive(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async restore(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.restore(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.resetPassword(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async forceLogout(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.forceLogout(req.user!.tenantId, req.params.id!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getSessions(req.user!.tenantId, req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.revokeSession(req.user!.tenantId, req.params.id!, req.params.sessionId!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async assignRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.assignRole(req.user!.tenantId, req.params.id!, req.body, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async removeRole(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.removeRole(req.user!.tenantId, req.params.id!, req.params.roleId!, req.user!.id);
      sendSuccess(res, null, result.message);
    } catch (err) { next(err); }
  }

  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getRoles(req.user!.tenantId, req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getActivity(req.user!.tenantId, req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async getLoginHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getLoginHistory(req.user!.tenantId, req.params.id!);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  async bulkImport(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.bulkImport(req.user!.tenantId, req.body, req.user!.id);
      sendSuccess(res, result, `Imported ${result.successful} of ${result.total} users`);
    } catch (err) { next(err); }
  }

  async exportUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, roleCode } = req.query;
      const result = await userService.exportUsers(req.user!.tenantId, { status: status as string, roleCode: roleCode as string });
      sendSuccess(res, result, 'Export data ready');
    } catch (err) { next(err); }
  }
}

export const userController = new UserController();
