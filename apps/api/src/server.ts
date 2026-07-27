import http from 'http';
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

    // Auto-seed Super Admin if not exists (first deployment)
    await ensureSuperAdmin();

    // Start BullMQ workers
    startWorkers();
    logger.info('BullMQ workers initialized');

    // Start HTTP server
    server.listen(env.apiPort, () => {
      logger.info(`API server running on port ${env.apiPort}`);
    });
  } catch (err) {
    logger.fatal({ err }, 'Failed to start server');
    process.exit(1);
  }
}

async function ensureSuperAdmin(): Promise<void> {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL || 'shivam95ku@gmail.com';
    const password = process.env.SUPER_ADMIN_PASSWORD || 'Circle@123';
    logger.info('[BOOT] ensureSuperAdmin started');

    // Check if platform tenant exists
    logger.info('[BOOT] checking platform tenant');
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'platform' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: 'SchoolNex Platform', slug: 'platform', status: 'active', subscriptionStatus: 'active', planCode: 'enterprise' },
      });
      logger.info('[BOOT] tenant CREATED');
    } else {
      logger.info('[BOOT] tenant EXISTS: ' + tenant.id);
    }

    // Check if super admin exists by email
    logger.info('[BOOT] checking super admin by email: ' + email);
    const existingByEmail = await prisma.user.findFirst({ where: { tenantId: tenant.id, email } });
    if (existingByEmail) {
      logger.info('[BOOT] super admin EXISTS (by email): ' + existingByEmail.id + ' status=' + existingByEmail.status);
      return;
    }

    // Also check by username 'superadmin' - may exist with different email
    const existingByUsername = await prisma.user.findFirst({ where: { tenantId: tenant.id, username: 'superadmin' } });
    if (existingByUsername) {
      logger.info('[BOOT] found existing user with username=superadmin, email=' + existingByUsername.email + ' - updating email/password');
      const bcrypt = await import('bcryptjs');
      const passwordHash = await bcrypt.default.hash(password, 12);
      await prisma.user.update({
        where: { id: existingByUsername.id },
        data: { email, passwordHash, firstName: 'Shivam', lastName: 'Kumar', status: 'active', emailVerified: true },
      });
      logger.info('[BOOT] super admin UPDATED: ' + existingByUsername.id + ' email now=' + email);

      // Ensure role assigned
      let role = await prisma.role.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'super_admin' } } });
      if (!role) {
        role = await prisma.role.create({ data: { tenantId: tenant.id, name: 'Super Admin', code: 'super_admin', isSystemRole: true } });
      }
      const existingRole = await prisma.userRole.findFirst({ where: { userId: existingByUsername.id, roleId: role.id } });
      if (!existingRole) {
        await prisma.userRole.create({ data: { userId: existingByUsername.id, roleId: role.id, tenantId: tenant.id } });
        logger.info('[BOOT] role ASSIGNED');
      }
      logger.info('[BOOT] startup completed (updated existing user)');
      return;
    }

    // Create super admin from scratch
    logger.info('[BOOT] super admin NOT FOUND - creating...');
    const bcrypt = await import('bcryptjs');
    const passwordHash = await bcrypt.default.hash(password, 12);
    const user = await prisma.user.create({
      data: { tenantId: tenant.id, firstName: 'Shivam', lastName: 'Kumar', email, username: 'superadmin', passwordHash, phone: '+919572495969', status: 'active', emailVerified: true },
    });
    logger.info('[BOOT] super admin CREATED: ' + user.id);

    // Ensure super_admin role exists
    let role = await prisma.role.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'super_admin' } } });
    if (!role) {
      role = await prisma.role.create({ data: { tenantId: tenant.id, name: 'Super Admin', code: 'super_admin', isSystemRole: true } });
      logger.info('[BOOT] role CREATED: ' + role.id);
    } else {
      logger.info('[BOOT] role EXISTS: ' + role.id);
    }

    // Assign role
    await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, tenantId: tenant.id } });
    logger.info('[BOOT] role ASSIGNED to user');
    logger.info('[BOOT] startup completed successfully');
  } catch (err: any) {
    logger.error({ err: err.message, stack: err.stack }, '[BOOT] ensureSuperAdmin FAILED');
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
