import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

// Mock all external dependencies before importing app
vi.mock('@erp/database', () => ({
  prisma: {
    tenant: { findUnique: vi.fn().mockResolvedValue(null) },
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
  },
}));

vi.mock('../../config/index.js', () => ({
  env: {
    apiPrefix: '/api/v1',
    corsOrigins: ['http://localhost:3000'],
    rateLimitWindowMs: 900000,
    rateLimitMaxRequests: 1000,
    nodeEnv: 'test',
    logLevel: 'silent',
    logFormat: 'json',
    appName: 'test',
    jwtAccessSecret: 'test-secret',
    isDevelopment: () => false,
    isProduction: () => false,
    isTest: () => true,
  },
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
  redis: { get: vi.fn().mockResolvedValue(null), ping: vi.fn().mockResolvedValue('PONG'), connect: vi.fn(), setex: vi.fn() },
  connectRedis: vi.fn(),
  disconnectRedis: vi.fn(),
}));

// Mock the tenant middleware to be a no-op in tests
vi.mock('../../middleware/tenant.middleware.js', () => ({
  resolveTenant: vi.fn((_req: any, _res: any, next: any) => next()),
  requireTenant: vi.fn((_req: any, _res: any, next: any) => next()),
}));

import { app } from '../../../app.js';

describe('Auth Routes - Integration', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 422 when email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'test' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 422 when password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 for invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'notanemail', password: 'test' });

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 422 when password is too weak', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com',
          password: 'weak',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 422 for invalid email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email: 'invalid' });

      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return 401 without auth token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });
  });
});
