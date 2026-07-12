import type { ValidationDetail } from '@erp/types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ValidationDetail[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ValidationDetail[],
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error factory functions
export const errors = {
  badRequest: (message: string, details?: ValidationDetail[]) =>
    new AppError(400, 'BAD_REQUEST', message, details),

  unauthorized: (message = 'Unauthorized') =>
    new AppError(401, 'UNAUTHORIZED', message),

  forbidden: (message = 'Access denied') =>
    new AppError(403, 'FORBIDDEN', message),

  notFound: (resource = 'Resource') =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`),

  conflict: (message: string) =>
    new AppError(409, 'CONFLICT', message),

  validationError: (message: string, details: ValidationDetail[]) =>
    new AppError(422, 'VALIDATION_ERROR', message, details),

  tooManyRequests: (message = 'Too many requests') =>
    new AppError(429, 'RATE_LIMITED', message),

  internal: (message = 'Internal server error') =>
    new AppError(500, 'INTERNAL_SERVER_ERROR', message, undefined, false),
};
