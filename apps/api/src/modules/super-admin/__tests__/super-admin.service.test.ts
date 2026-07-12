import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SuperAdminService } from '../super-admin.service.js';

vi.mock('@erp/database', () => ({
  prisma: {
    tenant: { count: vi.fn(), findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    user: { count: vi.fn(), findMany: vi.fn() },
    student: { count: vi.fn() },
    teacher: { count: vi.fn() },
    auditLog: { findMany: vi.fn(), count: vi.fn() },
    tenantSettings: { update: vi.fn() },
    featureFlag: { findMany: vi.fn(), upsert: vi.fn() },
    session: { updateMany: vi.fn() },
  },
}));

vi.mock('../../config/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../super-admin.repository.js', () => ({
  superAdminRepository: {
    getDashboardStats: vi.fn().mockResolvedValue({
      totalTenants: 10, activeTenants: 7, trialTenants: 2,
      suspendedTenants: 1, expiredTenants: 0, totalUsers: 50,
      totalStudents: 200, totalTeachers: 20,
    }),
    getRecentActivity: vi.fn().mockResolvedValue([]),
    getTenantGrowth: vi.fn().mockResolvedValue([]),
    listTenants: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    getTenantById: vi.fn().mockResolvedValue(null),
    checkSlugAvailable: vi.fn().mockResolvedValue(true),
    createTenant: vi.fn().mockResolvedValue({ id: 'new-id', slug: 'test' }),
    getTenantFeatures: vi.fn().mockResolvedValue([]),
  },
}));

describe('SuperAdminService', () => {
  let service: SuperAdminService;

  beforeEach(() => {
    service = new SuperAdminService();
    vi.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return stats, activity, and growth data', async () => {
      const result = await service.getDashboard();
      expect(result.stats).toBeDefined();
      expect(result.stats.totalTenants).toBe(10);
      expect(result.recentActivity).toBeInstanceOf(Array);
      expect(result.monthlyGrowth).toBeInstanceOf(Array);
    });
  });

  describe('createTenant', () => {
    it('should throw 409 if slug is taken', async () => {
      const { superAdminRepository } = await import('../super-admin.repository.js');
      vi.mocked(superAdminRepository.checkSlugAvailable).mockResolvedValue(false);

      await expect(
        service.createTenant({ name: 'Test', slug: 'taken', trialDays: 14 } as any, 'actor-1')
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });

    it('should create tenant when slug is available', async () => {
      const { superAdminRepository } = await import('../super-admin.repository.js');
      vi.mocked(superAdminRepository.checkSlugAvailable).mockResolvedValue(true);

      const result = await service.createTenant(
        { name: 'New Org', slug: 'new-org', trialDays: 14 } as any, 'actor-1'
      );
      expect(result.id).toBe('new-id');
    });
  });

  describe('getTenant', () => {
    it('should throw 404 when tenant not found', async () => {
      await expect(service.getTenant('non-existent')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });
});
