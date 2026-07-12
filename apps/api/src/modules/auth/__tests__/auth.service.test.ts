import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock dependencies BEFORE importing the service
vi.mock('@erp/database', () => ({
  prisma: {
    user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    tenant: { findUnique: vi.fn() },
    student: { findFirst: vi.fn().mockResolvedValue(null) },
    teacher: { findFirst: vi.fn().mockResolvedValue(null) },
    session: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn(), count: vi.fn(), findMany: vi.fn() },
    userRole: { findMany: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}));

vi.mock('../../config/index.js', () => ({
  env: {
    jwtAccessSecret: 'test-access-secret',
    jwtRefreshSecret: 'test-refresh-secret',
    jwtAccessExpiry: '15m',
    jwtRefreshExpiry: '7d',
  },
  redis: {
    get: vi.fn().mockResolvedValue(null),
    setex: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    incr: vi.fn().mockResolvedValue(1),
    expire: vi.fn().mockResolvedValue(1),
    lpush: vi.fn().mockResolvedValue(1),
    ltrim: vi.fn().mockResolvedValue('OK'),
    lrange: vi.fn().mockResolvedValue([]),
  },
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../auth.repository.js', () => ({
  authRepository: {
    findTenantBySlug: vi.fn(),
    findUserByEmail: vi.fn(),
    findUserByIdentifier: vi.fn(),
    findUserById: vi.fn(),
    createUser: vi.fn(),
    updateLastLogin: vi.fn(),
    getUserRoles: vi.fn().mockResolvedValue({ roles: ['teacher'], permissions: ['students:view'] }),
    countActiveSessions: vi.fn().mockResolvedValue(0),
    getActiveSessions: vi.fn().mockResolvedValue([]),
    createSession: vi.fn().mockResolvedValue({ id: 'sess-1' }),
    revokeSession: vi.fn(),
    createAuditLog: vi.fn(),
  },
}));

import { AuthService } from '../auth.service.js';
import { authRepository } from '../auth.repository.js';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should throw TENANT_NOT_FOUND when tenant slug is invalid', async () => {
      vi.mocked(authRepository.findTenantBySlug).mockResolvedValue(null);

      await expect(
        authService.login(
          { identifier: 'test@test.com', password: 'pass' },
          { ip: '127.0.0.1', userAgent: 'test' },
        ),
      ).rejects.toMatchObject({ code: 'TENANT_NOT_FOUND' });
    });

    it('should throw INVALID_CREDENTIALS when user not found', async () => {
      vi.mocked(authRepository.findTenantBySlug).mockResolvedValue({
        id: 'tenant-1', slug: 'platform', status: 'active',
      } as any);
      vi.mocked(authRepository.findUserByIdentifier).mockResolvedValue(null);

      await expect(
        authService.login(
          { identifier: 'nonexist@test.com', password: 'pass' },
          { ip: '127.0.0.1', userAgent: 'test' },
        ),
      ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    });
  });

  describe('register', () => {
    it('should throw CONFLICT when email already exists', async () => {
      vi.mocked(authRepository.findTenantBySlug).mockResolvedValue({
        id: 'tenant-1', slug: 'platform', status: 'active',
      } as any);
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ id: 'user-1' } as any);

      await expect(
        authService.register({
          firstName: 'Test', lastName: 'User',
          email: 'existing@test.com', password: 'Test@12345',
        }),
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });
  });
});
