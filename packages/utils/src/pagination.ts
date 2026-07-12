import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from './constants';
import type { PaginationMeta, PaginationQuery } from '@erp/types';

export interface PaginationParams {
  skip: number;
  take: number;
  page: number;
  limit: number;
}

/**
 * Parse and normalize pagination query parameters
 */
export function parsePagination(query: PaginationQuery): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(MIN_PAGE_SIZE, Number(query.limit) || DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;

  return { skip, take: limit, page, limit };
}

/**
 * Build pagination metadata from query and total count
 */
export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
