import { Request } from 'express';

/**
 * Resolve the branchId from the request.
 * Priority: query param > user's JWT branchId > empty string (no branch filter)
 */
export function resolveBranchId(req: Request): string {
  return (req.query.branchId as string) || req.user?.branchId || '';
}
