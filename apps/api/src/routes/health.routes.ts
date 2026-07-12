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

export { router as healthRouter };
