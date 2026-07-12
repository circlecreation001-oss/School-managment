import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import type { Permission, SystemRole } from '@erp/types';

/**
 * Middleware to check if user has the required role(s)
 */
export function requireRole(...roles: SystemRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
      return;
    }

    const hasRole = req.user.roles.some((r) => roles.includes(r as SystemRole));

    if (!hasRole) {
      next(
        new AppError(403, 'FORBIDDEN', 'You do not have the required role to perform this action'),
      );
      return;
    }

    next();
  };
}

/**
 * Middleware to check if user has the required permission(s)
 * @param requireAll - If true, user must have ALL permissions. If false, any one suffices.
 */
export function requirePermission(permissions: Permission[], requireAll = false) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication is required'));
      return;
    }

    // Super admin bypasses permission checks
    if (req.user.roles.includes('super_admin')) {
      next();
      return;
    }

    const userPermissions = req.user.permissions;
    const hasPermission = requireAll
      ? permissions.every((p) => userPermissions.includes(p))
      : permissions.some((p) => userPermissions.includes(p));

    if (!hasPermission) {
      next(
        new AppError(
          403,
          'FORBIDDEN',
          'You do not have the required permission to perform this action',
        ),
      );
      return;
    }

    next();
  };
}
