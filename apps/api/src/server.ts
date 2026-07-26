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
    // Check if platform tenant exists
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'platform' } });
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: { name: 'SchoolNex Platform', slug: 'platform', status: 'active', subscriptionStatus: 'active', planCode: 'enterprise' },
      });
      logger.info('Platform tenant created');
    }
    // Check if super admin exists
    const existing = await prisma.user.findFirst({ where: { tenantId: tenant.id, email } });
    if (!existing) {
      const bcrypt = await import('bcryptjs');
      const password = process.env.SUPER_ADMIN_PASSWORD || 'Circle@123';
      const passwordHash = await bcrypt.default.hash(password, 12);
      const user = await prisma.user.create({
        data: { tenantId: tenant.id, firstName: 'Shivam', lastName: 'Kumar', email, username: 'superadmin', passwordHash, phone: '+919572495969', status: 'active', emailVerified: true },
      });
      // Ensure super_admin role exists and assign
      let role = await prisma.role.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'super_admin' } } });
      if (!role) {
        role = await prisma.role.create({ data: { tenantId: tenant.id, name: 'Super Admin', code: 'super_admin', isSystemRole: true } });
      }
      await prisma.userRole.create({ data: { userId: user.id, roleId: role.id, tenantId: tenant.id } });
      logger.info({ email }, 'Super Admin auto-seeded on first startup');
    }
  } catch (err: any) {
    logger.warn({ err: err.message }, 'Auto-seed check skipped (non-critical)');
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
