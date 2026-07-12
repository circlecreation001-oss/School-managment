import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../user.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  redis: { setex: vi.fn().mockResolvedValue('OK') },
}));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByUsername: vi.fn(),
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  create: vi.fn().mockResolvedValue({ id: 'u1', tenantId: 't1', firstName: 'John', lastName: 'Doe', email: 'j@t.com' }),
  update: vi.fn().mockResolvedValue({ id: 'u1' }),
  softDelete: vi.fn(),
  restore: vi.fn(),
  assignRole: vi.fn(),
  removeRole: vi.fn(),
  findRoleByCode: vi.fn().mockResolvedValue({ id: 'r1', code: 'teacher' }),
  getUserRoles: vi.fn().mockResolvedValue([]),
  getActiveSessions: vi.fn().mockResolvedValue([]),
  revokeAllSessions: vi.fn(),
  revokeSession: vi.fn(),
  getAuditHistory: vi.fn().mockResolvedValue([]),
  getLoginHistory: vi.fn().mockResolvedValue([]),
  createMany: vi.fn(),
  exportUsers: vi.fn().mockResolvedValue([]),
};

vi.mock('../user.repository.js', () => ({ userRepository: mockRepo }));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create user successfully', async () => {
      mockRepo.findByEmail.mockResolvedValue(null);
      const result = await service.create('t1', {
        firstName: 'John', lastName: 'Doe', email: 'j@t.com',
        password: 'Test@1234', roleCode: 'teacher', status: 'active',
      } as any, 'actor-1');
      expect(result.id).toBe('u1');
    });

    it('should throw 409 if email exists', async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: 'existing' });
      await expect(
        service.create('t1', { email: 'dup@t.com', firstName: 'A', lastName: 'B', password: 'Test@1234', roleCode: 'teacher' } as any, 'actor')
      ).rejects.toMatchObject({ code: 'CONFLICT' });
    });
  });

  describe('getById', () => {
    it('should throw 404 if not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.getById('t1', 'bad-id')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });

    it('should throw 404 if wrong tenant', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'u1', tenantId: 'other-tenant', deletedAt: null });
      await expect(service.getById('t1', 'u1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    });
  });

  describe('suspend', () => {
    it('should suspend and revoke sessions', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'u1', tenantId: 't1', deletedAt: null });
      mockRepo.update.mockResolvedValue({ id: 'u1', status: 'suspended' });
      await service.suspend('t1', 'u1', 'actor');
      expect(mockRepo.revokeAllSessions).toHaveBeenCalledWith('u1', 'admin_suspended');
    });
  });
});

