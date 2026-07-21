import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { attendanceRepository } from './attendance.repository.js';
import type {
  MarkBulkAttendanceInput, MarkSingleAttendanceInput, MarkTeacherAttendanceInput,
  MarkStaffAttendanceInput, QrCheckInInput, DailyAttendanceQuery, MonthlyReportQuery, AnalyticsQuery,
} from './attendance.schema.js';

export class AttendanceService {
  // â”€â”€â”€ MARK STUDENT ATTENDANCE (Bulk) â”€â”€â”€
  async markBulkStudentAttendance(tenantId: string, branchId: string, input: MarkBulkAttendanceInput, actorId: string) {
    const date = new Date(input.date);

    // Check holiday
    const isHoliday = await attendanceRepository.isHoliday(tenantId, branchId, date);
    if (isHoliday) throw new AppError(400, 'BAD_REQUEST', 'Cannot mark attendance on a holiday');

    let marked = 0;
    for (const record of input.records) {
      await attendanceRepository.markStudentAttendance({
        tenantId, branchId, classId: input.classId,
        studentId: record.studentId, attendanceDate: date,
        status: record.status as any, remarks: record.remarks, markedBy: actorId,
      });
      marked++;
    }

    await this.audit(tenantId, actorId, 'attendance', null, 'mark_bulk', { date: input.date, classId: input.classId, count: marked });
    logger.info({ tenantId, date: input.date, classId: input.classId, count: marked, actorId }, 'Bulk attendance marked');
    return { marked, date: input.date, classId: input.classId };
  }

  // â”€â”€â”€ MARK SINGLE STUDENT â”€â”€â”€
  async markSingleStudent(tenantId: string, branchId: string, studentId: string, input: MarkSingleAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    const isHoliday = await attendanceRepository.isHoliday(tenantId, branchId, date);
    if (isHoliday) throw new AppError(400, 'BAD_REQUEST', 'Cannot mark attendance on a holiday');

    // Get student's class
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
    if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');

    await attendanceRepository.markStudentAttendance({
      tenantId, branchId, classId: student.classId,
      studentId, attendanceDate: date,
      status: input.status as any, remarks: input.remarks, markedBy: actorId,
    });

    return { studentId, date: input.date, status: input.status };
  }

  // â”€â”€â”€ MARK TEACHER ATTENDANCE â”€â”€â”€
  async markTeacherAttendance(tenantId: string, branchId: string, input: MarkTeacherAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    let marked = 0;
    for (const record of input.records) {
      await attendanceRepository.markTeacherAttendance({
        tenantId, branchId, teacherId: record.teacherId,
        attendanceDate: date, status: record.status as any,
        remarks: record.remarks, markedBy: actorId,
      });
      marked++;
    }
    await this.audit(tenantId, actorId, 'attendance', null, 'mark_teacher', { date: input.date, count: marked });
    return { marked, date: input.date };
  }

  // â”€â”€â”€ MARK STAFF ATTENDANCE â”€â”€â”€
  async markStaffAttendance(tenantId: string, branchId: string, input: MarkStaffAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    let marked = 0;
    for (const record of input.records) {
      await attendanceRepository.markStaffAttendance({
        tenantId, branchId, staffId: record.staffId,
        attendanceDate: date, status: record.status as any,
        remarks: record.remarks, markedBy: actorId,
      });
      marked++;
    }
    await this.audit(tenantId, actorId, 'attendance', null, 'mark_staff', { date: input.date, count: marked });
    return { marked, date: input.date };
  }

  // â”€â”€â”€ QR / BIOMETRIC CHECK-IN â”€â”€â”€
  async qrCheckIn(tenantId: string, branchId: string, input: QrCheckInInput, actorId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (input.studentId) {
      const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { classId: true } });
      if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');
      await attendanceRepository.markStudentAttendance({
        tenantId, branchId, classId: student.classId, studentId: input.studentId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'student', id: input.studentId, status: 'present', method: input.method };
    }
    if (input.teacherId) {
      await attendanceRepository.markTeacherAttendance({
        tenantId, branchId, teacherId: input.teacherId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'teacher', id: input.teacherId, status: 'present', method: input.method };
    }
    if (input.staffId) {
      await attendanceRepository.markStaffAttendance({
        tenantId, branchId, staffId: input.staffId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'staff', id: input.staffId, status: 'present', method: input.method };
    }
    throw new AppError(400, 'BAD_REQUEST', 'One of studentId, teacherId, or staffId is required');
  }

  // â”€â”€â”€ QUERIES â”€â”€â”€
  async getDailyStudentAttendance(tenantId: string, branchId: string, query: DailyAttendanceQuery) {
    const date = new Date(query.date);
    return attendanceRepository.getStudentDailyAttendance(tenantId, branchId, date, query.classId, query.sectionId);
  }

  async getDailyTeacherAttendance(tenantId: string, branchId: string, date: string) {
    return attendanceRepository.getTeacherDailyAttendance(tenantId, branchId, new Date(date));
  }

  async getDailyStaffAttendance(tenantId: string, branchId: string, date: string) {
    return attendanceRepository.getStaffDailyAttendance(tenantId, branchId, new Date(date));
  }

  // â”€â”€â”€ MONTHLY REPORT â”€â”€â”€
  async getMonthlyReport(tenantId: string, branchId: string, query: MonthlyReportQuery) {
    const startDate = new Date(query.year, query.month - 1, 1);
    const endDate = new Date(query.year, query.month, 0);

    if (query.studentId) {
      return attendanceRepository.getStudentMonthlyAttendance(tenantId, query.studentId, startDate, endDate);
    }
    if (query.teacherId) {
      return attendanceRepository.getTeacherMonthlyAttendance(tenantId, query.teacherId, startDate, endDate);
    }
    if (query.classId) {
      return attendanceRepository.getClassMonthlyReport(tenantId, query.classId, startDate, endDate);
    }
    throw new AppError(400, 'BAD_REQUEST', 'Specify classId, studentId, or teacherId');
  }

  // â”€â”€â”€ ANALYTICS â”€â”€â”€
  async getAnalytics(tenantId: string, branchId: string, query: AnalyticsQuery) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const stats = await attendanceRepository.getAttendanceStats(tenantId, branchId, startDate, endDate, query.classId);
    const trend = await attendanceRepository.getDailyTrend(tenantId, branchId, startDate, endDate, query.classId);
    return { stats, trend };
  }

  // â”€â”€â”€ ABSENTEES â”€â”€â”€
  async getAbsentees(tenantId: string, branchId: string, date: string, classId?: string) {
    return attendanceRepository.getAbsentees(tenantId, branchId, new Date(date), classId);
  }

  // â”€â”€â”€ HOLIDAYS â”€â”€â”€
  async getHolidays(tenantId: string, branchId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return attendanceRepository.getHolidays(tenantId, branchId, startDate, endDate);
  }

  // â”€â”€â”€ PRIVATE â”€â”€â”€
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: (metadata as any) || undefined } });
  }
}

export const attendanceService = new AttendanceService();
