import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReportService } from '../report.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  getDashboardKPIs: vi.fn().mockResolvedValue({ totalStudents: 500, totalTeachers: 30, totalStaff: 15, totalInvoices: 200, paidInvoices: 150, pendingFeeAmount: 250000, collectionRate: 75 }),
  getAttendanceReport: vi.fn().mockResolvedValue({ total: 1000, breakdown: { present: 900, absent: 80, late: 20 }, percentage: 90 }),
  getAttendanceTrend: vi.fn().mockResolvedValue([]),
  getFeeReport: vi.fn().mockResolvedValue({ invoiceCount: 200, totalBilled: 1000000, totalCollected: 750000, totalOutstanding: 250000, paymentCount: 180, byMethod: [] }),
  getRevenueTrend: vi.fn().mockResolvedValue([{ month: '2025-07', amount: 150000 }]),
  getStudentReport: vi.fn().mockResolvedValue({ total: 500, byStatus: [], byGender: [], byClass: [] }),
  getTeacherReport: vi.fn().mockResolvedValue({ total: 30, byStatus: [], byDepartment: [] }),
  getExamResultsReport: vi.fn().mockResolvedValue({ totalResults: 1500, totalStudents: 200, avgPercentage: 68.5 }),
};
vi.mock('../report.repository.js', () => ({ reportRepository: mockRepo }));

describe('ReportService', () => {
  let service: ReportService;
  beforeEach(() => { service = new ReportService(); vi.clearAllMocks(); });

  it('returns dashboard analytics with KPIs', async () => {
    const r = await service.getDashboardAnalytics('t1');
    expect(r.kpis.totalStudents).toBe(500);
    expect(r.kpis.collectionRate).toBe(75);
  });

  it('returns attendance report with percentage', async () => {
    const r = await service.getAttendanceReport('t1', { startDate: '2025-07-01', endDate: '2025-07-31', type: 'student', groupBy: 'daily' });
    expect(r.summary.percentage).toBe(90);
  });

  it('returns fee report with totals', async () => {
    const r = await service.getFeeReport('t1', { startDate: '2025-07-01', endDate: '2025-07-31' });
    expect(r.totalCollected).toBe(750000);
  });

  it('returns revenue trend', async () => {
    const r = await service.getRevenueReport('t1', 2025);
    expect(r[0]?.month).toBe('2025-07');
  });
});

