import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class AttendanceRepository {
  // â”€â”€â”€ Student Attendance â”€â”€â”€
  async markStudentAttendance(data: any /* Prisma.AttendanceUncheckedCreateInput */) {
    return prisma.attendance.upsert({
      where: { student_date_unique: { studentId: data.studentId!, attendanceDate: data.attendanceDate } },
      update: { status: data.status, remarks: data.remarks, markedBy: data.markedBy },
      create: data,
    });
  }

  async getStudentDailyAttendance(tenantId: string, branchId: string, date: Date, classId?: string, sectionId?: string) {
    const where: Prisma.AttendanceWhereInput = { tenantId, branchId, attendanceDate: date, studentId: { not: null } };
    if (classId) where.classId = classId;
    return prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true, rollNumber: true, admissionNumber: true } } },
      orderBy: { student: { firstName: 'asc' } },
    });
  }

  async getStudentMonthlyAttendance(tenantId: string, studentId: string, startDate: Date, endDate: Date) {
    return prisma.attendance.findMany({
      where: { tenantId, studentId, attendanceDate: { gte: startDate, lte: endDate } },
      orderBy: { attendanceDate: 'asc' },
    });
  }

  async getClassMonthlyReport(tenantId: string, classId: string, startDate: Date, endDate: Date) {
    return prisma.attendance.findMany({
      where: { tenantId, classId, studentId: { not: null }, attendanceDate: { gte: startDate, lte: endDate } },
      include: { student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } } },
      orderBy: [{ student: { firstName: 'asc' } }, { attendanceDate: 'asc' }],
    });
  }

  // â”€â”€â”€ Teacher Attendance â”€â”€â”€
  async markTeacherAttendance(data: any /* Prisma.AttendanceUncheckedCreateInput */) {
    return prisma.attendance.upsert({
      where: { teacher_date_unique: { teacherId: data.teacherId!, attendanceDate: data.attendanceDate } },
      update: { status: data.status, remarks: data.remarks, markedBy: data.markedBy },
      create: data,
    });
  }

  async getTeacherDailyAttendance(tenantId: string, branchId: string, date: Date) {
    return prisma.attendance.findMany({
      where: { tenantId, branchId, attendanceDate: date, teacherId: { not: null } },
      include: { teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } },
      orderBy: { teacher: { firstName: 'asc' } },
    });
  }

  async getTeacherMonthlyAttendance(tenantId: string, teacherId: string, startDate: Date, endDate: Date) {
    return prisma.attendance.findMany({
      where: { tenantId, teacherId, attendanceDate: { gte: startDate, lte: endDate } },
      orderBy: { attendanceDate: 'asc' },
    });
  }

  // â”€â”€â”€ Staff Attendance â”€â”€â”€
  async markStaffAttendance(data: any /* Prisma.AttendanceUncheckedCreateInput */) {
    return prisma.attendance.upsert({
      where: { staff_date_unique: { staffId: data.staffId!, attendanceDate: data.attendanceDate } },
      update: { status: data.status, remarks: data.remarks, markedBy: data.markedBy },
      create: data,
    });
  }

  async getStaffDailyAttendance(tenantId: string, branchId: string, date: Date) {
    return prisma.attendance.findMany({
      where: { tenantId, branchId, attendanceDate: date, staffId: { not: null } },
      include: { staff: { select: { id: true, firstName: true, lastName: true, employeeCode: true } } },
    });
  }

  // â”€â”€â”€ Analytics â”€â”€â”€
  async getAttendanceStats(tenantId: string, branchId: string, startDate: Date, endDate: Date, classId?: string) {
    const where: Prisma.AttendanceWhereInput = {
      tenantId, branchId, studentId: { not: null },
      attendanceDate: { gte: startDate, lte: endDate },
    };
    if (classId) where.classId = classId;

    const total = await prisma.attendance.count({ where });
    const present = await prisma.attendance.count({ where: { ...where, status: 'present' } });
    const absent = await prisma.attendance.count({ where: { ...where, status: 'absent' } });
    const late = await prisma.attendance.count({ where: { ...where, status: 'late' } });
    const halfDay = await prisma.attendance.count({ where: { ...where, status: 'half_day' } });
    const onLeave = await prisma.attendance.count({ where: { ...where, status: 'leave' } });

    return { total, present, absent, late, halfDay, onLeave, percentage: total > 0 ? Math.round((present / total) * 100) : 0 };
  }

  async getDailyTrend(tenantId: string, branchId: string, startDate: Date, endDate: Date, classId?: string) {
    const where: Prisma.AttendanceWhereInput = {
      tenantId, branchId, studentId: { not: null },
      attendanceDate: { gte: startDate, lte: endDate },
    };
    if (classId) where.classId = classId;

    return prisma.attendance.groupBy({
      by: ['attendanceDate', 'status'],
      where,
      _count: { id: true },
      orderBy: { attendanceDate: 'asc' },
    });
  }

  async getAbsentees(tenantId: string, branchId: string, date: Date, classId?: string) {
    const where: Prisma.AttendanceWhereInput = {
      tenantId, branchId, attendanceDate: date, status: 'absent', studentId: { not: null },
    };
    if (classId) where.classId = classId;
    return prisma.attendance.findMany({
      where,
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true, phone: true } } },
    });
  }

  // â”€â”€â”€ Holidays â”€â”€â”€
  async getHolidays(tenantId: string, branchId: string | null, startDate: Date, endDate: Date) {
    const where: Prisma.HolidayWhereInput = { tenantId, date: { gte: startDate, lte: endDate } };
    if (branchId) where.OR = [{ branchId }, { branchId: null }];
    return prisma.holiday.findMany({ where, orderBy: { date: 'asc' } });
  }

  async isHoliday(tenantId: string, branchId: string | null, date: Date): Promise<boolean> {
    const count = await prisma.holiday.count({
      where: { tenantId, date, OR: [{ branchId }, { branchId: null }] },
    });
    return count > 0;
  }
}

export const attendanceRepository = new AttendanceRepository();
