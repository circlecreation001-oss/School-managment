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

  // System metrics
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '0.1.0',
    checks,
    workers: workerHealth,
    system: {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        unit: 'MB',
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
        unit: 'ms',
      },
    },
  });
});

export { router as healthRouter };
