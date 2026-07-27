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

// Force-create Super Admin (one-time use, remove after first login works)
router.get('/debug/create-super-admin', async (_req: Request, res: Response) => {
  try {
    const bcrypt = await import('bcryptjs');
    const tenantId = 'cmrejm5600008trwr6a0fdy1';
    const newEmail = 'shivam95ku@gmail.com';
    const password = 'Circle@123';

    // Strategy: find existing user with username 'superadmin' and update their email + password
    const existingByUsername = await prisma.user.findFirst({ where: { tenantId, username: 'superadmin' } });

    if (existingByUsername) {
      // Update existing super admin with new email and password
      const passwordHash = await bcrypt.default.hash(password, 12);
      const updated = await prisma.user.update({
        where: { id: existingByUsername.id },
        data: { email: newEmail, passwordHash, firstName: 'Shivam', lastName: 'Kumar', status: 'active', emailVerified: true },
      });
      return res.json({ success: true, action: 'UPDATED existing user', userId: updated.id, oldEmail: existingByUsername.email, newEmail, message: 'Login with: shivam95ku@gmail.com / Circle@123' });
    }

    // No existing user - create new
    const passwordHash = await bcrypt.default.hash(password, 12);
    const user = await prisma.user.create({
      data: { tenantId, firstName: 'Shivam', lastName: 'Kumar', email: newEmail, username: 'superadmin', passwordHash, phone: '+919572495969', status: 'active', emailVerified: true },
    });

    // Assign role
    let role = await prisma.role.findUnique({ where: { tenantId_code: { tenantId, code: 'super_admin' } } });
    if (!role) {
      role = await prisma.role.create({ data: { tenantId, name: 'Super Admin', code: 'super_admin', isSystemRole: true } });
    }
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, tenantId } });

    res.json({ success: true, action: 'CREATED new user', userId: user.id, email: newEmail, message: 'Login with: shivam95ku@gmail.com / Circle@123' });
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export { router as healthRouter };
