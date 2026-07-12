import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from '../attendance.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() }, student: { findUnique: vi.fn().mockResolvedValue({ classId: 'c1' }) } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn(), warn: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  markStudentAttendance: vi.fn().mockResolvedValue({ id: 'a1' }),
  markTeacherAttendance: vi.fn().mockResolvedValue({ id: 'a2' }),
  markStaffAttendance: vi.fn().mockResolvedValue({ id: 'a3' }),
  getStudentDailyAttendance: vi.fn().mockResolvedValue([]),
  getTeacherDailyAttendance: vi.fn().mockResolvedValue([]),
  getStaffDailyAttendance: vi.fn().mockResolvedValue([]),
  getStudentMonthlyAttendance: vi.fn().mockResolvedValue([]),
  getTeacherMonthlyAttendance: vi.fn().mockResolvedValue([]),
  getClassMonthlyReport: vi.fn().mockResolvedValue([]),
  getAttendanceStats: vi.fn().mockResolvedValue({ total: 100, present: 90, absent: 8, late: 2, halfDay: 0, onLeave: 0, percentage: 90 }),
  getDailyTrend: vi.fn().mockResolvedValue([]),
  getAbsentees: vi.fn().mockResolvedValue([]),
  getHolidays: vi.fn().mockResolvedValue([]),
  isHoliday: vi.fn().mockResolvedValue(false),
};
vi.mock('../attendance.repository.js', () => ({ attendanceRepository: mockRepo }));

describe('AttendanceService', () => {
  let service: AttendanceService;
  beforeEach(() => { service = new AttendanceService(); vi.clearAllMocks(); });

  it('marks bulk student attendance', async () => {
    const r = await service.markBulkStudentAttendance('t1', 'b1', {
      date: '2025-07-01', classId: 'c1', records: [{ studentId: 's1', status: 'present' }],
    }, 'actor');
    expect(r.marked).toBe(1);
  });

  it('rejects attendance on holiday', async () => {
    mockRepo.isHoliday.mockResolvedValue(true);
    await expect(service.markBulkStudentAttendance('t1', 'b1', {
      date: '2025-08-15', classId: 'c1', records: [{ studentId: 's1', status: 'present' }],
    }, 'actor')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('marks teacher attendance', async () => {
    const r = await service.markTeacherAttendance('t1', 'b1', {
      date: '2025-07-01', records: [{ teacherId: 't1', status: 'present' }],
    }, 'actor');
    expect(r.marked).toBe(1);
  });

  it('returns analytics with percentage', async () => {
    const r = await service.getAnalytics('t1', 'b1', { startDate: '2025-07-01', endDate: '2025-07-31', type: 'student' });
    expect(r.stats.percentage).toBe(90);
  });
});

