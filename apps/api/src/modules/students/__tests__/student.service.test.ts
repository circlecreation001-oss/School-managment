import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentService } from '../student.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() }, student: { groupBy: vi.fn().mockResolvedValue([]) } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn(),
  findByAdmissionNumber: vi.fn(),
  create: vi.fn().mockResolvedValue({ id: 'st1', admissionNumber: 'ADM25001', firstName: 'John' }),
  update: vi.fn().mockResolvedValue({ id: 'st1' }),
  softDelete: vi.fn(),
  createParent: vi.fn().mockResolvedValue({ id: 'p1' }),
  linkParentToStudent: vi.fn(),
  getStudentParents: vi.fn().mockResolvedValue([]),
  removeParentLink: vi.fn(),
  addDocument: vi.fn().mockResolvedValue({ id: 'd1' }),
  getDocuments: vi.fn().mockResolvedValue([]),
  deleteDocument: vi.fn(),
  verifyDocument: vi.fn(),
  promoteStudents: vi.fn(),
  transferStudent: vi.fn(),
  getCertificates: vi.fn().mockResolvedValue([]),
  countByClass: vi.fn().mockResolvedValue([]),
  createMany: vi.fn(),
  exportStudents: vi.fn().mockResolvedValue([]),
  getNextAdmissionNumber: vi.fn().mockResolvedValue('ADM2500001'),
};

vi.mock('../student.repository.js', () => ({ studentRepository: mockRepo }));

describe('StudentService', () => {
  let service: StudentService;
  beforeEach(() => { service = new StudentService(); vi.clearAllMocks(); });

  it('admits a student', async () => {
    const r = await service.admit('t1', 'b1', {
      firstName: 'John', lastName: 'Doe', classId: 'c1', academicSessionId: 's1',
    } as any, 'actor');
    expect(r.admissionNumber).toBe('ADM25001');
  });

  it('throws 404 for non-existent student', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getById('t1', 'bad')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws 404 if wrong tenant', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'st1', tenantId: 'other', deletedAt: null });
    await expect(service.getById('t1', 'st1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('promotes students', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'st1', tenantId: 't1', deletedAt: null });
    const r = await service.promote('t1', 'b1', { studentIds: ['st1'], toClassId: 'c2', toAcademicSessionId: 's2' }, 'actor');
    expect(r.message).toContain('promoted');
  });
});

