import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HomeworkService } from '../homework.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() }, submission: { findUnique: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getById: vi.fn(),
  create: vi.fn().mockResolvedValue({ id: 'hw1', title: 'Math HW', status: 'published' }),
  update: vi.fn().mockResolvedValue({ id: 'hw1' }),
  delete: vi.fn(),
  addAttachment: vi.fn(),
  getSubmission: vi.fn().mockResolvedValue(null),
  createSubmission: vi.fn().mockResolvedValue({ id: 'sub1', status: 'submitted' }),
  updateSubmission: vi.fn().mockResolvedValue({ id: 'sub1' }),
  getSubmissions: vi.fn().mockResolvedValue([]),
  getStudentSubmissions: vi.fn().mockResolvedValue([]),
};
vi.mock('../homework.repository.js', () => ({ homeworkRepository: mockRepo }));

describe('HomeworkService', () => {
  let service: HomeworkService;
  beforeEach(() => { service = new HomeworkService(); vi.clearAllMocks(); });

  it('creates homework', async () => {
    const r = await service.create('t1', 'teacher1', { classId: 'c1', subjectId: 's1', title: 'Math HW', dueDate: '2025-08-01T00:00:00Z' } as any, 'actor');
    expect(r.id).toBe('hw1');
  });

  it('throws 404 for missing homework', async () => {
    mockRepo.getById.mockResolvedValue(null);
    await expect(service.getById('t1', 'bad')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('submits homework (new submission)', async () => {
    mockRepo.getById.mockResolvedValue({ id: 'hw1', tenantId: 't1', deletedAt: null, status: 'published', dueDate: new Date(Date.now() + 86400000) });
    const r = await service.submit('t1', 'hw1', 'stu1', { content: 'my answer' });
    expect(r.status).toBe('submitted');
  });

  it('marks late submission', async () => {
    mockRepo.getById.mockResolvedValue({ id: 'hw1', tenantId: 't1', deletedAt: null, status: 'published', dueDate: new Date(Date.now() - 86400000) });
    mockRepo.createSubmission.mockResolvedValue({ id: 'sub1', status: 'late' });
    const r = await service.submit('t1', 'hw1', 'stu1', { content: 'late' });
    expect(r.status).toBe('late');
  });

  it('rejects submission when homework is closed', async () => {
    mockRepo.getById.mockResolvedValue({ id: 'hw1', tenantId: 't1', deletedAt: null, status: 'closed', dueDate: new Date() });
    await expect(service.submit('t1', 'hw1', 'stu1', { content: 'x' })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

