import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class TeacherRepository {
  async list(tenantId: string, branchId: string, params: {
    page?: number; limit?: number; search?: string; departmentId?: string;
    status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.TeacherWhereInput = { tenantId, branchId, deletedAt: null };
    if (params.departmentId) where.departmentId = params.departmentId;
    if (params.status) where.status = params.status as any;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { employeeCode: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.teacher.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return prisma.teacher.findUnique({
      where: { id },
      include: {
        department: { select: { id: true, name: true } },
        subjects: { include: { subject: { select: { id: true, name: true, code: true } } } },
      },
    });
  }

  async create(data: any /* Prisma.TeacherUncheckedCreateInput */) {
    return prisma.teacher.create({ data });
  }

  async update(id: string, data: any /* Prisma.TeacherUpdateInput */) {
    return prisma.teacher.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.teacher.update({ where: { id }, data: { deletedAt: new Date(), status: 'terminated' } });
  }

  async getNextEmployeeCode(tenantId: string): Promise<string> {
    const count = await prisma.teacher.count({ where: { tenantId } });
    return `EMP${String(count + 1).padStart(5, '0')}`;
  }

  // â”€â”€â”€ Qualifications â”€â”€â”€
  async getQualifications(teacherId: string) {
    return prisma.teacherQualification.findMany({ where: { teacherId }, orderBy: { year: 'desc' } });
  }
  async addQualification(data: any /* Prisma.TeacherQualificationUncheckedCreateInput */) {
    return prisma.teacherQualification.create({ data });
  }
  async deleteQualification(id: string) { return prisma.teacherQualification.delete({ where: { id } }); }

  // â”€â”€â”€ Experience â”€â”€â”€
  async getExperiences(teacherId: string) {
    return prisma.teacherExperience.findMany({ where: { teacherId }, orderBy: { fromDate: 'desc' } });
  }
  async addExperience(data: any /* Prisma.TeacherExperienceUncheckedCreateInput */) {
    return prisma.teacherExperience.create({ data });
  }
  async deleteExperience(id: string) { return prisma.teacherExperience.delete({ where: { id } }); }

  // â”€â”€â”€ Salary â”€â”€â”€
  async getSalary(teacherId: string) {
    return prisma.teacherSalary.findUnique({ where: { teacherId } });
  }
  async upsertSalary(teacherId: string, data: any /* Prisma.TeacherSalaryUncheckedCreateInput */) {
    return prisma.teacherSalary.upsert({
      where: { teacherId },
      update: data,
      create: { ...data, teacherId },
    });
  }

  // â”€â”€â”€ Subjects â”€â”€â”€
  async assignSubjects(teacherId: string, subjectIds: string[]) {
    // Remove existing, reassign
    await prisma.teacherSubject.deleteMany({ where: { teacherId } });
    if (subjectIds.length > 0) {
      await prisma.teacherSubject.createMany({
        data: subjectIds.map((subjectId) => ({ teacherId, subjectId })),
      });
    }
    return prisma.teacherSubject.findMany({ where: { teacherId }, include: { subject: { select: { id: true, name: true } } } });
  }
  async getSubjects(teacherId: string) {
    return prisma.teacherSubject.findMany({ where: { teacherId }, include: { subject: true } });
  }

  // â”€â”€â”€ Documents â”€â”€â”€
  async getDocuments(teacherId: string) {
    return prisma.teacherDocument.findMany({ where: { teacherId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }
  async addDocument(data: any /* Prisma.TeacherDocumentUncheckedCreateInput */) {
    return prisma.teacherDocument.create({ data });
  }
  async deleteDocument(id: string) {
    return prisma.teacherDocument.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // â”€â”€â”€ Timetable â”€â”€â”€
  async getTimetable(tenantId: string, teacherId: string) {
    return prisma.timetable.findMany({
      where: { tenantId, teacherId, deletedAt: null },
      include: { class: { select: { name: true } }, subject: { select: { name: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  // â”€â”€â”€ Attendance summary â”€â”€â”€
  async getAttendanceSummary(teacherId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    return prisma.attendance.findMany({
      where: { teacherId, attendanceDate: { gte: startDate, lte: endDate } },
      orderBy: { attendanceDate: 'asc' },
    });
  }

  // â”€â”€â”€ Leave balance (simplified) â”€â”€â”€
  async getLeaves(teacherId: string) {
    return prisma.leave.findMany({ where: { teacherId }, orderBy: { startDate: 'desc' } });
  }
  async getLeaveStats(teacherId: string, year: number) {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);
    return prisma.leave.groupBy({
      by: ['leaveType', 'status'],
      where: { teacherId, startDate: { gte: startOfYear, lte: endOfYear } },
      _sum: { totalDays: true },
    });
  }
}

export const teacherRepository = new TeacherRepository();
