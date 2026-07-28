import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../config/index.js';
import { AppError } from '../utils/errors.js';

const isProduction = process.env.NODE_ENV === 'production';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Log error (never log passwords, tokens, or sensitive body fields)
  const sanitizedUrl = req.originalUrl.replace(/token=[^&]+/g, 'token=***');
  logger.error(
    {
      err: isProduction ? { message: err.message, code: (err as any).code } : err,
      method: req.method,
      url: sanitizedUrl,
      requestId: req.id,
    },
    'Error',
  );

  // Handle known application errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details || [],
      },
    });
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The provided input is invalid',
        details,
      },
    });
    return;
  }

  // Handle unexpected errors - NEVER expose internals in production
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isProduction
        ? 'An unexpected error occurred'
        : err.message || 'Internal server error',
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}
