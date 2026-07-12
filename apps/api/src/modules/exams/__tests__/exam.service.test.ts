import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamService } from '../exam.service.js';

vi.mock('@erp/database', () => ({
  prisma: { auditLog: { create: vi.fn() }, result: { upsert: vi.fn().mockResolvedValue({ id: 'r1' }) } },
}));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  listExams: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getExam: vi.fn(),
  createExam: vi.fn().mockResolvedValue({ id: 'ex1', name: 'Mid Term' }),
  updateExam: vi.fn().mockResolvedValue({ id: 'ex1' }),
  deleteExam: vi.fn(),
  upsertResult: vi.fn().mockResolvedValue({ id: 'r1' }),
  getResults: vi.fn().mockResolvedValue([]),
  publishResults: vi.fn(),
  getStudentResults: vi.fn().mockResolvedValue([]),
  listGrades: vi.fn().mockResolvedValue([]),
  createGrade: vi.fn().mockResolvedValue({ id: 'g1', name: 'A+' }),
  deleteGrade: vi.fn(),
  findGradeForMarks: vi.fn().mockResolvedValue({ id: 'g1', name: 'A+', gradePoint: 10 }),
  getExamAnalytics: vi.fn().mockResolvedValue({ count: 30, highest: 95, lowest: 22, average: 67, passCount: 25, failCount: 5, passPercentage: 83 }),
  getClassPerformance: vi.fn().mockResolvedValue([]),
  getReportCardData: vi.fn().mockResolvedValue({ student: { firstName: 'John' }, results: [] }),
};
vi.mock('../exam.repository.js', () => ({ examRepository: mockRepo }));

describe('ExamService', () => {
  let service: ExamService;
  beforeEach(() => { service = new ExamService(); vi.clearAllMocks(); });

  it('creates an exam', async () => {
    const r = await service.createExam('t1', 'b1', { name: 'Mid Term', examType: 'mid_term', academicSessionId: 's1', classId: 'c1', subjectId: 'sub1', totalMarks: 100 } as any, 'actor');
    expect(r.id).toBe('ex1');
  });

  it('enters marks with grade auto-assignment', async () => {
    mockRepo.getExam.mockResolvedValue({ id: 'ex1', tenantId: 't1', totalMarks: 100 });
    const r = await service.enterMarks('t1', { examId: 'ex1', marks: [{ studentId: 's1', marksObtained: 85 }] }, 'actor');
    expect(r.entered).toBe(1);
  });

  it('rejects marks exceeding total', async () => {
    mockRepo.getExam.mockResolvedValue({ id: 'ex1', tenantId: 't1', totalMarks: 100 });
    await expect(service.enterMarks('t1', { examId: 'ex1', marks: [{ studentId: 's1', marksObtained: 150 }] }, 'actor')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('returns analytics', async () => {
    const r = await service.getExamAnalytics('t1', 'ex1');
    expect(r.passPercentage).toBe(83);
  });
});

