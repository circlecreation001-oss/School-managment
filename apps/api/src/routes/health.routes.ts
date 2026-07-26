import { Router, Request, Response } from 'express';
import { prisma } from '@erp/database';
import { redis } from '../config/index.js';
import { getWorkerHealth } from '../workers/index.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const checks: Record<string, string> = {};

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  // Redis check
  try {
    await redis.ping();
    checks.redis = 'healthy';
  } catch {
    checks.redis = 'unhealthy';
  }

  // Worker check
  const workerHealth = getWorkerHealth();
  checks.workers = workerHealth.every((w) => w.running) ? 'healthy' : 'degraded';

  const isHealthy = checks.database === 'healthy' && checks.redis === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks,
    workers: workerHealth,
  });
});

// Diagnostic: verify super admin exists (remove after launch)
router.get('/debug/super-admin', async (_req: Request, res: Response) => {
  try {
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'platform' } });
    if (!tenant) return res.json({ exists: false, reason: 'no platform tenant' });

    const email = process.env.SUPER_ADMIN_EMAIL || 'shivam95ku@gmail.com';
    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email },
      select: { id: true, email: true, status: true, firstName: true, lastName: true, deletedAt: true, createdAt: true },
    });

    if (!user) return res.json({ exists: false, reason: 'user not found', tenantId: tenant.id, searchEmail: email });

    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: { select: { code: true, name: true } } },
    });

    res.json({
      exists: true,
      user,
      roles: roles.map(r => r.role.code),
      tenantId: tenant.id,
      tenantStatus: tenant.status,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as healthRouter };
