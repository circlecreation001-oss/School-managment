import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { attendanceRepository } from './attendance.repository.js';
import { NotificationTriggers } from '../notifications/index.js';
import type {
  MarkBulkAttendanceInput, MarkSingleAttendanceInput, MarkTeacherAttendanceInput,
  MarkStaffAttendanceInput, QrCheckInInput, DailyAttendanceQuery, MonthlyReportQuery, AnalyticsQuery,
} from './attendance.schema.js';

export class AttendanceService {
  // --- MARK STUDENT ATTENDANCE (Bulk) ---
  async markBulkStudentAttendance(tenantId: string, branchId: string, input: MarkBulkAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    const branch = branchId || null;

    const isHoliday = await attendanceRepository.isHoliday(tenantId, branch, date);
    if (isHoliday) throw new AppError(400, 'BAD_REQUEST', 'Cannot mark attendance on a holiday');

    let marked = 0;
    const absentStudents: Array<{ studentId: string; studentName: string; parentPhone?: string; parentEmail?: string }> = [];

    for (const record of input.records) {
      await attendanceRepository.markStudentAttendance({
        tenantId, branchId: branch, classId: input.classId,
        studentId: record.studentId, attendanceDate: date,
        status: record.status as any, remarks: record.remarks, markedBy: actorId,
      });
      marked++;

      // Collect absent students for notification
      if (record.status === 'absent') {
        const student = await prisma.student.findUnique({
          where: { id: record.studentId },
          select: { firstName: true, lastName: true, parentLinks: { include: { parent: true } } },
        });
        if (student) {
          const primaryParent = student.parentLinks.find((pl) => pl.isPrimary)?.parent;
          absentStudents.push({
            studentId: record.studentId,
            studentName: `${student.firstName} ${student.lastName}`,
            parentPhone: primaryParent?.phone,
            parentEmail: primaryParent?.email,
          });
        }
      }
    }

    await this.audit(tenantId, actorId, 'attendance', null, 'mark_bulk', { date: input.date, classId: input.classId, count: marked });
    logger.info({ tenantId, date: input.date, classId: input.classId, count: marked, actorId }, 'Bulk attendance marked');

    // Trigger attendance alerts for absent students
    if (absentStudents.length > 0) {
      try {
        for (const abs of absentStudents) {
          await NotificationTriggers.attendanceAlert(tenantId, {
            studentName: abs.studentName,
            date: date.toISOString().split('T')[0],
            status: 'absent',
            parentPhone: abs.parentPhone,
            parentEmail: abs.parentEmail,
          });
        }
      } catch (notifyErr) {
        logger.warn({ err: notifyErr }, 'Failed to send attendance alerts');
      }
    }

    return { marked, date: input.date, classId: input.classId };
  }

  // --- MARK SINGLE STUDENT ---
  async markSingleStudent(tenantId: string, branchId: string, studentId: string, input: MarkSingleAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    const branch = branchId || null;

    const isHoliday = await attendanceRepository.isHoliday(tenantId, branch, date);
    if (isHoliday) throw new AppError(400, 'BAD_REQUEST', 'Cannot mark attendance on a holiday');

    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { classId: true } });
    if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');

    await attendanceRepository.markStudentAttendance({
      tenantId, branchId: branch, classId: student.classId,
      studentId, attendanceDate: date,
      status: input.status as any, remarks: input.remarks, markedBy: actorId,
    });

    return { studentId, date: input.date, status: input.status };
  }

  // --- MARK TEACHER ATTENDANCE ---
  async markTeacherAttendance(tenantId: string, branchId: string, input: MarkTeacherAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    const branch = branchId || null;
    let marked = 0;
    for (const record of input.records) {
      await attendanceRepository.markTeacherAttendance({
        tenantId, branchId: branch, teacherId: record.teacherId,
        attendanceDate: date, status: record.status as any,
        remarks: record.remarks, markedBy: actorId,
      });
      marked++;
    }
    await this.audit(tenantId, actorId, 'attendance', null, 'mark_teacher', { date: input.date, count: marked });
    return { marked, date: input.date };
  }

  // --- MARK STAFF ATTENDANCE ---
  async markStaffAttendance(tenantId: string, branchId: string, input: MarkStaffAttendanceInput, actorId: string) {
    const date = new Date(input.date);
    const branch = branchId || null;
    let marked = 0;
    for (const record of input.records) {
      await attendanceRepository.markStaffAttendance({
        tenantId, branchId: branch, staffId: record.staffId,
        attendanceDate: date, status: record.status as any,
        remarks: record.remarks, markedBy: actorId,
      });
      marked++;
    }
    await this.audit(tenantId, actorId, 'attendance', null, 'mark_staff', { date: input.date, count: marked });
    return { marked, date: input.date };
  }

  // --- QR / BIOMETRIC CHECK-IN ---
  async qrCheckIn(tenantId: string, branchId: string, input: QrCheckInInput, actorId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const branch = branchId || null;

    if (input.studentId) {
      const student = await prisma.student.findUnique({ where: { id: input.studentId }, select: { classId: true } });
      if (!student) throw new AppError(404, 'NOT_FOUND', 'Student not found');
      await attendanceRepository.markStudentAttendance({
        tenantId, branchId: branch, classId: student.classId, studentId: input.studentId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'student', id: input.studentId, status: 'present', method: input.method };
    }
    if (input.teacherId) {
      await attendanceRepository.markTeacherAttendance({
        tenantId, branchId: branch, teacherId: input.teacherId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'teacher', id: input.teacherId, status: 'present', method: input.method };
    }
    if (input.staffId) {
      await attendanceRepository.markStaffAttendance({
        tenantId, branchId: branch, staffId: input.staffId,
        attendanceDate: today, status: 'present', remarks: `${input.method} check-in`, markedBy: actorId,
      });
      return { type: 'staff', id: input.staffId, status: 'present', method: input.method };
    }
    throw new AppError(400, 'BAD_REQUEST', 'One of studentId, teacherId, or staffId is required');
  }

  // --- QUERIES ---
  async getDailyStudentAttendance(tenantId: string, branchId: string, query: DailyAttendanceQuery) {
    const date = new Date(query.date);
    return attendanceRepository.getStudentDailyAttendance(tenantId, branchId || null, date, query.classId, query.sectionId);
  }

  async getDailyTeacherAttendance(tenantId: string, branchId: string, date: string) {
    return attendanceRepository.getTeacherDailyAttendance(tenantId, branchId || null, new Date(date));
  }

  async getDailyStaffAttendance(tenantId: string, branchId: string, date: string) {
    return attendanceRepository.getStaffDailyAttendance(tenantId, branchId || null, new Date(date));
  }

  // --- MONTHLY REPORT ---
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
    // If no filter specified, return empty array instead of error
    return [];
  }

  // --- ANALYTICS ---
  async getAnalytics(tenantId: string, branchId: string, query: AnalyticsQuery) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const stats = await attendanceRepository.getAttendanceStats(tenantId, branchId || null, startDate, endDate, query.classId);
    const trend = await attendanceRepository.getDailyTrend(tenantId, branchId || null, startDate, endDate, query.classId);
    return { stats, trend };
  }

  // --- ABSENTEES ---
  async getAbsentees(tenantId: string, branchId: string, date: string, classId?: string) {
    return attendanceRepository.getAbsentees(tenantId, branchId || null, new Date(date), classId);
  }

  // --- HOLIDAYS ---
  async getHolidays(tenantId: string, branchId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return attendanceRepository.getHolidays(tenantId, branchId || null, startDate, endDate);
  }

  // --- PRIVATE ---
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    try {
      await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: (metadata as any) || undefined } });
    } catch {
      // Non-fatal: don't crash attendance marking if audit fails
    }
  }
}

export const attendanceService = new AttendanceService();
