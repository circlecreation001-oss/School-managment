import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MaterialService } from '../material.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getById: vi.fn(),
  create: vi.fn().mockResolvedValue({ id: 'm1', title: 'Physics Notes' }),
  update: vi.fn().mockResolvedValue({ id: 'm1' }),
  delete: vi.fn(),
  incrementDownloads: vi.fn(),
};
vi.mock('../material.repository.js', () => ({ materialRepository: mockRepo }));

describe('MaterialService', () => {
  let service: MaterialService;
  beforeEach(() => { service = new MaterialService(); vi.clearAllMocks(); });

  it('creates material', async () => {
    const r = await service.create('t1', 'teacher1', { title: 'Physics Notes', category: 'notes' } as any, 'actor');
    expect(r.id).toBe('m1');
  });

  it('throws 404 for missing material', async () => {
    mockRepo.getById.mockResolvedValue(null);
    await expect(service.getById('t1', 'bad')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('increments download count', async () => {
    mockRepo.getById.mockResolvedValue({ id: 'm1', tenantId: 't1', deletedAt: null, fileUrl: 'http://example.com/file.pdf' });
    await service.download('t1', 'm1');
    expect(mockRepo.incrementDownloads).toHaveBeenCalledWith('m1');
  });
});

