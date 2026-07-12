import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { AppError } from '../utils/errors.js';
import type { TokenPayload, AuthenticatedUser } from '@erp/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenantId?: string;
      id?: string;
    }
  }
}

/**
 * Middleware to authenticate requests using JWT access tokens
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'AUTHENTICATION_REQUIRED', 'Authentication token is required');
    }

    const token = authHeader.substring(7);

    const payload = jwt.verify(token, env.jwtAccessSecret) as TokenPayload;

    req.user = {
      id: payload.sub,
      email: '', // Will be populated from DB if needed
      firstName: '',
      lastName: '',
      tenantId: payload.tenantId,
      institutionId: payload.institutionId,
      branchId: payload.branchId,
      roles: payload.roles,
      permissions: payload.permissions,
      status: 'active',
    };

    req.tenantId = payload.tenantId;

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'TOKEN_EXPIRED', 'Access token has expired'));
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'TOKEN_INVALID', 'Invalid access token'));
      return;
    }
    next(err);
  }
}

/**
 * Optional authentication - continues even if no token present
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  authenticate(req, _res, next);
}
