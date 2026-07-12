import { Request, Response, NextFunction } from 'express';
import { prisma } from '@erp/database';
import { AppError } from '../utils/errors.js';
import { logger } from '../config/index.js';
import type { TenantContext } from '@erp/types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      tenant?: TenantContext;
    }
  }
}

/**
 * Middleware to resolve and attach tenant context to the request.
 * Resolves tenant from JWT claims, subdomain, or x-tenant-id header.
 */
export function resolveTenant(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Priority 1: From authenticated user (JWT claims)
    if (req.user?.tenantId) {
      loadTenantContext(req.user.tenantId, req)
        .then(() => next())
        .catch(next);
      return;
    }

    // Priority 2: From x-tenant-id header (for public APIs)
    const headerTenantId = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenantId) {
      loadTenantContext(headerTenantId, req)
        .then(() => next())
        .catch(next);
      return;
    }

    // Priority 3: From subdomain
    const host = req.hostname;
    const subdomain = extractSubdomain(host);
    if (subdomain) {
      loadTenantBySlug(subdomain, req)
        .then(() => next())
        .catch(next);
      return;
    }

    // No tenant context found - allow for public routes
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Middleware that requires tenant context to be present
 */
export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenant) {
    next(new AppError(400, 'TENANT_REQUIRED', 'Tenant context is required for this operation'));
    return;
  }

  if (req.tenant.status === 'suspended') {
    next(new AppError(403, 'TENANT_SUSPENDED', 'This institution account has been suspended'));
    return;
  }

  if (req.tenant.status === 'expired') {
    next(new AppError(403, 'TENANT_EXPIRED', 'This institution subscription has expired'));
    return;
  }

  next();
}

async function loadTenantContext(tenantId: string, req: Request): Promise<void> {
  // Check Redis cache first (performance)
  const { redis } = await import('../config/index.js');
  const cacheKey = `tenant:ctx:${tenantId}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    req.tenant = JSON.parse(cached);
    req.tenantId = tenantId;
    return;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      slug: true,
      domain: true,
      status: true,
      planCode: true,
    },
  });

  if (!tenant) {
    throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant not found');
  }

  const ctx: TenantContext = {
    tenantId: tenant.id,
    slug: tenant.slug,
    domain: tenant.domain || undefined,
    status: tenant.status as TenantContext['status'],
    plan: tenant.planCode || undefined,
    features: [],
  };

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(ctx));

  req.tenant = ctx;
  req.tenantId = tenant.id;
}

async function loadTenantBySlug(slug: string, req: Request): Promise<void> {
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      domain: true,
      status: true,
      planCode: true,
    },
  });

  if (!tenant) {
    logger.warn({ slug }, 'Tenant not found by slug');
    return; // Don't throw - might be a public route
  }

  req.tenant = {
    tenantId: tenant.id,
    slug: tenant.slug,
    domain: tenant.domain || undefined,
    status: tenant.status as TenantContext['status'],
    plan: tenant.planCode || undefined,
    features: [],
  };

  req.tenantId = tenant.id;
}

function extractSubdomain(host: string): string | null {
  const parts = host.split('.');
  if (parts.length >= 3) {
    return parts[0] || null;
  }
  return null;
}
