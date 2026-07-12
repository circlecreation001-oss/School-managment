import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Middleware to assign a unique request ID to every incoming request
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  next();
}
