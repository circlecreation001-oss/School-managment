import http from 'http';
import bcrypt from 'bcryptjs';
import { app } from './app.js';
import { env, logger, connectRedis, disconnectRedis, initializeSocket } from './config/index.js';
import { prisma } from '@erp/database';
import { startWorkers, stopWorkers } from './workers/index.js';

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

async function bootstrap(): Promise<void> {
  // Connect to Redis (non-fatal in development)
  try {
    await connectRedis();
    logger.info('Redis connected');
  } catch (err: any) {
    if (env.nodeEnv === 'production') {
      logger.fatal({ err }, 'Redis connection required in production');
      process.exit(1);
    }
    logger.warn({ err: err.message }, 'Redis unavailable — running without cache/queues');
  }

  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Ensure Platform Super Admin exists
    await ensurePlatformSuperAdmin();

    // Repair any tenants missing permissions
    await repairTenantPermissions();

    // Start BullMQ workers (non-fatal if Redis unavailable)
    try {
      startWorkers();
      logger.info('BullMQ workers initialized');
    } catch (err: any) {
      logger.warn({ err: err.message }, 'BullMQ workers failed to start (Redis unavailable)');
    }

    // Start HTTP server
    server.listen(env.apiPort, () => {
      logger.info(`SchoolNex API running on port ${env.apiPort}`);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

/**
 * Ensures the Platform Super Admin exists on every startup.
 * Credentials are read exclusively from environment variables.
 * If the password env var changes, the stored hash is updated automatically.
 * This account is completely separate from tenant admins created via /signup.
 */
async function ensurePlatformSuperAdmin(): Promise<void> {
  const email = process.env.SUPER_ADMIN_EMAIL;
  const password = process.env.SUPER_ADMIN_PASSWORD;

  if (!email || !password) {
    logger.warn('[BOOT] SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD not set - skipping Platform Super Admin');
    return;
  }

  try {
    // 1. Ensure platform tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'platform' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'SchoolNex Platform',
          slug: 'platform',
          status: 'active',
          subscriptionStatus: 'active',
          planCode: 'enterprise',
        },
      });
      logger.info('[BOOT] Platform tenant created');
    }

    // 2. Ensure super_admin role exists for this tenant
    let role = await prisma.role.findUnique({
      where: { tenantId_code: { tenantId: tenant.id, code: 'super_admin' } },
    });
    if (!role) {
      role = await prisma.role.create({
        data: { tenantId: tenant.id, name: 'Super Admin', code: 'super_admin', isSystemRole: true },
      });
      logger.info('[BOOT] super_admin role created');
    }

    // 3. Check if Super Admin user exists
    const existing = await prisma.user.findFirst({
      where: { tenantId: tenant.id, email: email.toLowerCase().trim() },
    });

    if (existing) {
      // 4. If password env changed, rehash and update
      const passwordMatch = await bcrypt.compare(password, existing.passwordHash);
      if (!passwordMatch) {
        const newHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: newHash },
        });
        logger.info('[BOOT] Platform Super Admin password updated (env var changed)');
      }

      // Ensure status is active
      if (existing.status !== 'active') {
        await prisma.user.update({
          where: { id: existing.id },
          data: { status: 'active' },
        });
      }

      // Ensure role is assigned
      const roleAssignment = await prisma.userRole.findFirst({
        where: { userId: existing.id, roleId: role.id },
      });
      if (!roleAssignment) {
        await prisma.userRole.create({
          data: { userId: existing.id, roleId: role.id, tenantId: tenant.id },
        });
        logger.info('[BOOT] super_admin role re-assigned to existing user');
      }

      logger.info('[BOOT] Platform Super Admin exists');
      return;
    }

    // 5. User does not exist - check if old admin with username 'superadmin' exists (migration)
    const oldAdmin = await prisma.user.findFirst({
      where: { tenantId: tenant.id, username: 'superadmin' },
    });

    if (oldAdmin) {
      // Migrate: update email, password, status
      const passwordHash = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { id: oldAdmin.id },
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          status: 'active',
          emailVerified: true,
        },
      });

      // Ensure role assigned
      const roleAssignment = await prisma.userRole.findFirst({
        where: { userId: oldAdmin.id, roleId: role.id },
      });
      if (!roleAssignment) {
        await prisma.userRole.create({
          data: { userId: oldAdmin.id, roleId: role.id, tenantId: tenant.id },
        });
      }

      logger.info('[BOOT] Platform Super Admin migrated from old admin account');
      return;
    }

    // 6. Create brand new Super Admin
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        firstName: process.env.SUPER_ADMIN_FIRST_NAME || 'Super',
        lastName: process.env.SUPER_ADMIN_LAST_NAME || 'Admin',
        email: email.toLowerCase().trim(),
        username: 'superadmin',
        passwordHash,
        phone: process.env.SUPER_ADMIN_PHONE || '',
        status: 'active',
        emailVerified: true,
      },
    });

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id, tenantId: tenant.id },
    });

    logger.info('[BOOT] Platform Super Admin created successfully');
  } catch (err: any) {
    logger.error({ err: err.message, stack: err.stack }, '[BOOT] ensurePlatformSuperAdmin failed');
  }
}

/**
 * Repairs tenants that were created before the permission seeding fix.
 * Checks every tenant: if tenant_admin role has 0 permissions, seeds all permissions.
 */
async function repairTenantPermissions(): Promise<void> {
  try {
    const MODULES = ['users','students','teachers','parents','attendance','fees','exams','homework','study_materials','library','notifications','reports','settings','website','admissions'];
    const ACTIONS = ['view','create','edit','delete','approve','export','configure','manage'];

    // Find all tenants
    const tenants = await prisma.tenant.findMany({ select: { id: true, slug: true } });

    for (const tenant of tenants) {
      // Check if tenant_admin role has permissions
      const adminRole = await prisma.role.findUnique({
        where: { tenantId_code: { tenantId: tenant.id, code: 'tenant_admin' } },
        include: { rolePermissions: { take: 1 } },
      });

      if (!adminRole) continue; // No tenant_admin role = skip
      if (adminRole.rolePermissions.length > 0) continue; // Already has permissions = skip

      // This tenant needs repair
      logger.info({ tenantId: tenant.id, slug: tenant.slug }, '[BOOT] Repairing tenant permissions');

// Create all permissions if missing
      const permCount = await prisma.permission.count({ where: { tenantId: tenant.id } });
      if (permCount === 0) {
        for (const mod of MODULES) {
          for (const act of ACTIONS) {
            await prisma.permission.create({
              data: { tenantId: tenant.id, code: `${mod}:${act}`, name: `${act} ${mod}`, module: mod, action: act },
            });
          }
        }
        logger.info({ tenantId: tenant.id }, '[BOOT] Created 120 permissions');
      }

      // Assign all permissions to tenant_admin role
      const allPerms = await prisma.permission.findMany({ where: { tenantId: tenant.id }, select: { id: true } });
      for (const perm of allPerms) {
        await prisma.rolePermission.upsert({
          where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
          update: {},
          create: { roleId: adminRole.id, permissionId: perm.id },
        });
      }

      logger.info({ tenantId: tenant.id, permCount: allPerms.length }, '[BOOT] tenant_admin permissions repaired');
    }
  } catch (err: any) {
    logger.error({ err: err.message }, '[BOOT] repairTenantPermissions failed');
  }
}

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    await stopWorkers();
    await disconnectRedis();
    await prisma.$disconnect();
    logger.info('Server shut down gracefully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'Unhandled rejection');
});
process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception');
  process.exit(1);
});

bootstrap();
