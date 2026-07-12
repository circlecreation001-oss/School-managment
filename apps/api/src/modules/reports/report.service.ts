import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { reportRepository } from './report.repository.js';
import type { AttendanceReportInput, FeeReportInput, StudentReportInput, ExportInput } from './report.schema.js';

export class ReportService {
  // ─── DASHBOARD ───
  async getDashboardAnalytics(tenantId: string, branchId?: string) {
    const kpis = await reportRepository.getDashboardKPIs(tenantId, branchId);
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const revenue = await reportRepository.getRevenueTrend(tenantId, today.getFullYear());
    return { kpis, revenueTrend: revenue };
  }

  // ─── ATTENDANCE ───
  async getAttendanceReport(tenantId: string, input: AttendanceReportInput) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    const summary = await reportRepository.getAttendanceReport(tenantId, startDate, endDate, input.classId, input.type);
    const trend = await reportRepository.getAttendanceTrend(tenantId, startDate, endDate, input.classId);

    // Group trend by date
    const dailyData: Record<string, Record<string, number>> = {};
    for (const item of trend) {
      const dateKey = (item.attendanceDate as Date).toISOString().split('T')[0]!;
      if (!dailyData[dateKey]) dailyData[dateKey] = {};
      dailyData[dateKey]![item.status] = item._count.id;
    }

    return { summary, trend: Object.entries(dailyData).map(([date, statuses]) => ({ date, ...statuses })) };
  }

  // ─── FEES ───
  async getFeeReport(tenantId: string, input: FeeReportInput) {
    return reportRepository.getFeeReport(tenantId, new Date(input.startDate), new Date(input.endDate), input.classId, input.status);
  }

  async getRevenueReport(tenantId: string, year: number) {
    return reportRepository.getRevenueTrend(tenantId, year);
  }

  // ─── STUDENTS ───
  async getStudentReport(tenantId: string, branchId: string, input: StudentReportInput) {
    return reportRepository.getStudentReport(tenantId, branchId, input.classId, input.status, input.gender);
  }

  // ─── TEACHERS ───
  async getTeacherReport(tenantId: string, branchId: string) {
    return reportRepository.getTeacherReport(tenantId, branchId);
  }

  // ─── EXAM RESULTS ───
  async getExamResultsReport(tenantId: string, sessionId: string, classId?: string) {
    return reportRepository.getExamResultsReport(tenantId, sessionId, classId);
  }

  // ─── EXPORT ───
  async generateExport(tenantId: string, input: ExportInput, actorId: string) {
    // In production, this would queue a job to generate the file
    // and return a download URL once ready
    logger.info({ tenantId, reportType: input.reportType, format: input.format, actorId }, 'Export requested');

    await prisma.auditLog.create({
      data: { tenantId, actorUserId: actorId, entityType: 'report', action: 'export', metadata: { reportType: input.reportType, format: input.format } },
    });

    return {
      message: `${input.reportType} export in ${input.format} format has been queued`,
      reportType: input.reportType,
      format: input.format,
      status: 'queued',
    };
  }
}

export const reportService = new ReportService();
