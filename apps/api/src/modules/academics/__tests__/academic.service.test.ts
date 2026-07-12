import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AcademicService } from '../academic.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  listSessions: vi.fn().mockResolvedValue([]),
  getSession: vi.fn(),
  createSession: vi.fn().mockResolvedValue({ id: 's1', name: '2025-2026' }),
  updateSession: vi.fn().mockResolvedValue({ id: 's1' }),
  setCurrentSession: vi.fn(),
  listClasses: vi.fn().mockResolvedValue([]),
  getClass: vi.fn(),
  createClass: vi.fn().mockResolvedValue({ id: 'c1', name: 'Class 10' }),
  updateClass: vi.fn().mockResolvedValue({ id: 'c1' }),
  deleteClass: vi.fn(),
  listSections: vi.fn().mockResolvedValue([]),
  createSection: vi.fn().mockResolvedValue({ id: 'sec1' }),
  getSection: vi.fn(),
  updateSection: vi.fn().mockResolvedValue({ id: 'sec1' }),
  deleteSection: vi.fn(),
  listSubjects: vi.fn().mockResolvedValue([]),
  createSubject: vi.fn().mockResolvedValue({ id: 'sub1' }),
  getSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
  listDepartments: vi.fn().mockResolvedValue([]),
  createDepartment: vi.fn().mockResolvedValue({ id: 'd1' }),
  getDepartment: vi.fn(),
  updateDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  listCourses: vi.fn().mockResolvedValue([]),
  createCourse: vi.fn().mockResolvedValue({ id: 'co1' }),
  getCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  listSubjectGroups: vi.fn().mockResolvedValue([]),
  createSubjectGroup: vi.fn().mockResolvedValue({ id: 'sg1' }),
  deleteSubjectGroup: vi.fn(),
  assignClassTeacher: vi.fn().mockResolvedValue({ id: 'ct1' }),
  listClassTeachers: vi.fn().mockResolvedValue([]),
  assignSubjectTeacher: vi.fn().mockResolvedValue({ id: 'st1' }),
  listSubjectTeachers: vi.fn().mockResolvedValue([]),
  listPromotionRules: vi.fn().mockResolvedValue([]),
  createPromotionRule: vi.fn().mockResolvedValue({ id: 'pr1' }),
  deletePromotionRule: vi.fn(),
  listCalendarEvents: vi.fn().mockResolvedValue([]),
  createCalendarEvent: vi.fn().mockResolvedValue({ id: 'ev1' }),
  updateCalendarEvent: vi.fn().mockResolvedValue({ id: 'ev1' }),
  deleteCalendarEvent: vi.fn(),
};

vi.mock('../academic.repository.js', () => ({ academicRepository: mockRepo }));

describe('AcademicService', () => {
  let service: AcademicService;
  beforeEach(() => { service = new AcademicService(); vi.clearAllMocks(); });

  it('creates session', async () => {
    const r = await service.createSession('t1', { name: '2025-2026', startDate: '2025-04-01T00:00:00Z', endDate: '2026-03-31T00:00:00Z', isCurrent: true }, 'a1');
    expect(r.id).toBe('s1');
  });

  it('creates class', async () => {
    const r = await service.createClass('t1', 'b1', { name: 'Class 10', code: 'CLS10', academicSessionId: 's1' }, 'a1');
    expect(r.id).toBe('c1');
  });

  it('throws 404 for non-existent class', async () => {
    mockRepo.getClass.mockResolvedValue(null);
    await expect(service.getClass('t1', 'bad')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('creates calendar event', async () => {
    const r = await service.createCalendarEvent('t1', 'b1', { title: 'Holiday', eventType: 'holiday', startDate: '2025-08-15T00:00:00Z', isAllDay: true }, 'a1');
    expect(r.id).toBe('ev1');
  });
});

