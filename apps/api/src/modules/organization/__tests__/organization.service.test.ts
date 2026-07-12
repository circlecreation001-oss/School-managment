import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OrganizationService } from '../organization.service.js';

vi.mock('@erp/database', () => ({
  prisma: {
    tenant: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
    tenantSettings: { update: vi.fn(), findUnique: vi.fn() },
    plan: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    subscription: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    organizationConfig: { findMany: vi.fn(), upsert: vi.fn() },
    featureFlag: { findMany: vi.fn(), upsert: vi.fn() },
    user: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    student: { count: vi.fn() },
    teacher: { count: vi.fn() },
    institution: { count: vi.fn() },
    userRole: { upsert: vi.fn() },
    role: { findUnique: vi.fn() },
  },
}));

vi.mock('../../config/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('../organization.repository.js', () => ({
  organizationRepository: {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
    create: vi.fn().mockResolvedValue({ id: 'org-1', slug: 'test', settings: {} }),
    update: vi.fn().mockResolvedValue({ id: 'org-1' }),
    softDelete: vi.fn(),
    isSlugAvailable: vi.fn().mockResolvedValue(true),
    isDomainAvailable: vi.fn().mockResolvedValue(true),
    updateSettings: vi.fn().mockResolvedValue({}),
    getSettings: vi.fn().mockResolvedValue({}),
    getActiveSubscription: vi.fn().mockResolvedValue(null),
    listSubscriptions: vi.fn().mockResolvedValue([]),
    findPlanByCode: vi.fn().mockResolvedValue({ id: 'p1', code: 'starter', price: 999, currency: 'INR' }),
    createSubscription: vi.fn().mockResolvedValue({ id: 's1' }),
    expireSubscription: vi.fn(),
    getConfigs: vi.fn().mockResolvedValue([]),
    upsertConfig: vi.fn(),
    getFeatures: vi.fn().mockResolvedValue([]),
    upsertFeature: vi.fn(),
    getOrgAdmins: vi.fn().mockResolvedValue([]),
    getUsageStats: vi.fn().mockResolvedValue({ users: 0, students: 0, teachers: 0, institutions: 0 }),
    listPlans: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../auth/auth.repository.js', () => ({
  authRepository: {
    findUserByEmail: vi.fn().mockResolvedValue(null),
    findRoleByCode: vi.fn().mockResolvedValue({ id: 'role-1' }),
    assignRoleToUser: vi.fn(),
  },
}));

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(() => {
    service = new OrganizationService();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create an organization successfully', async () => {
      const result = await service.create({
        name: 'Test School', slug: 'test-school', trialDays: 14,
      } as any, 'actor-1');

      expect(result.id).toBe('org-1');
    });

    it('should throw 409 if slug is taken', async () => {
      const { organizationRepository } = await import('../organization.repository.js');
      vi.mocked(organizationRepository.isSlugAvailable).mockResolvedValue(false);

      await expect(
        service.create({ name: 'Test', slug: 'taken', trialDays: 14 } as any, 'actor-1')
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });
  });

  describe('suspend', () => {
    it('should throw 404 when org not found', async () => {
      const { organizationRepository } = await import('../organization.repository.js');
      vi.mocked(organizationRepository.findById).mockResolvedValue(null);

      await expect(service.suspend('bad-id', 'actor-1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw if already suspended', async () => {
      const { organizationRepository } = await import('../organization.repository.js');
      vi.mocked(organizationRepository.findById).mockResolvedValue({ id: '1', status: 'suspended' } as any);

      await expect(service.suspend('1', 'actor-1')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    });
  });

  describe('assignSubscription', () => {
    it('should assign subscription successfully', async () => {
      const { organizationRepository } = await import('../organization.repository.js');
      vi.mocked(organizationRepository.findById).mockResolvedValue({ id: 'org-1' } as any);

      const result = await service.assignSubscription('org-1', {
        planCode: 'starter', billingCycle: 'annual',
      }, 'actor-1');

      expect(result.id).toBe('s1');
    });
  });
});
