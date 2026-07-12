import { Response } from 'express';
import type { PaginationMeta } from '@erp/types';

/**
 * Send a successful response with data
 */
export function sendSuccess<T>(res: Response, data: T, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send a successful response for created resources
 */
export function sendCreated<T>(res: Response, data: T, message = 'Created successfully') {
  return sendSuccess(res, data, message, 201);
}

/**
 * Send a successful list response with pagination metadata
 */
export function sendList<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  message = 'Records fetched successfully',
) {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta,
  });
}

/**
 * Send a no-content response (e.g., after deletion)
 */
export function sendNoContent(res: Response) {
  return res.status(204).send();
}
