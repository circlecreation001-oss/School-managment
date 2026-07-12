import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TeacherService } from '../teacher.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() }, attendance: { findMany: vi.fn().mockResolvedValue([]) } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  list: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  findById: vi.fn(),
  create: vi.fn().mockResolvedValue({ id: 't1', employeeCode: 'EMP00001', firstName: 'Jane' }),
  update: vi.fn().mockResolvedValue({ id: 't1' }),
  softDelete: vi.fn(),
  getNextEmployeeCode: vi.fn().mockResolvedValue('EMP00001'),
  getQualifications: vi.fn().mockResolvedValue([]),
  addQualification: vi.fn().mockResolvedValue({ id: 'q1' }),
  deleteQualification: vi.fn(),
  getExperiences: vi.fn().mockResolvedValue([]),
  addExperience: vi.fn().mockResolvedValue({ id: 'e1' }),
  deleteExperience: vi.fn(),
  getSalary: vi.fn().mockResolvedValue(null),
  upsertSalary: vi.fn().mockResolvedValue({ teacherId: 't1' }),
  assignSubjects: vi.fn().mockResolvedValue([]),
  getSubjects: vi.fn().mockResolvedValue([]),
  getDocuments: vi.fn().mockResolvedValue([]),
  addDocument: vi.fn().mockResolvedValue({ id: 'd1' }),
  deleteDocument: vi.fn(),
  getTimetable: vi.fn().mockResolvedValue([]),
  getAttendanceSummary: vi.fn().mockResolvedValue([]),
  getLeaves: vi.fn().mockResolvedValue([]),
  getLeaveStats: vi.fn().mockResolvedValue([]),
};
vi.mock('../teacher.repository.js', () => ({ teacherRepository: mockRepo }));

describe('TeacherService', () => {
  let service: TeacherService;
  beforeEach(() => { service = new TeacherService(); vi.clearAllMocks(); });

  it('creates a teacher with auto employee code', async () => {
    const r = await service.create('t1', 'b1', { firstName: 'Jane', lastName: 'Smith' } as any, 'actor');
    expect(r.employeeCode).toBe('EMP00001');
  });

  it('throws 404 for non-existent teacher', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(service.getById('t1', 'bad')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('assigns subjects', async () => {
    mockRepo.findById.mockResolvedValue({ id: 't1', tenantId: 't1', deletedAt: null });
    await service.assignSubjects('t1', 't1', { subjectIds: ['s1', 's2'] }, 'actor');
    expect(mockRepo.assignSubjects).toHaveBeenCalledWith('t1', ['s1', 's2']);
  });
});

