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
  try {
    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected');

    // Verify database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Ensure Platform Super Admin exists (env-driven, no hardcoded credentials)
    await ensurePlatformSuperAdmin();

    // Start BullMQ workers
    startWorkers();
    logger.info('BullMQ workers initialized');

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
