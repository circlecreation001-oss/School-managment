import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class AcademicRepository {
  // ─── Sessions ───
  async listSessions(tenantId: string) {
    return prisma.academicSession.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { startDate: 'desc' },
    });
  }
  async getSession(id: string) {
    return prisma.academicSession.findUnique({ where: { id } });
  }
  async createSession(data: Prisma.AcademicSessionUncheckedCreateInput) {
    return prisma.academicSession.create({ data });
  }
  async updateSession(id: string, data: Prisma.AcademicSessionUpdateInput) {
    return prisma.academicSession.update({ where: { id }, data });
  }
  async setCurrentSession(tenantId: string, sessionId: string) {
    await prisma.academicSession.updateMany({ where: { tenantId, isCurrent: true }, data: { isCurrent: false } });
    return prisma.academicSession.update({ where: { id: sessionId }, data: { isCurrent: true } });
  }

  // ─── Departments ───
  async listDepartments(tenantId: string, branchId: string) {
    return prisma.department.findMany({
      where: { tenantId, branchId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }
  async getDepartment(id: string) {
    return prisma.department.findUnique({ where: { id } });
  }
  async createDepartment(data: Prisma.DepartmentUncheckedCreateInput) {
    return prisma.department.create({ data });
  }
  async updateDepartment(id: string, data: Prisma.DepartmentUpdateInput) {
    return prisma.department.update({ where: { id }, data });
  }
  async deleteDepartment(id: string) {
    return prisma.department.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } });
  }

  // ─── Courses / Streams ───
  async listCourses(tenantId: string, branchId: string) {
    return prisma.course.findMany({ where: { tenantId, branchId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
  async getCourse(id: string) { return prisma.course.findUnique({ where: { id } }); }
  async createCourse(data: Prisma.CourseUncheckedCreateInput) { return prisma.course.create({ data }); }
  async updateCourse(id: string, data: Prisma.CourseUpdateInput) { return prisma.course.update({ where: { id }, data }); }
  async deleteCourse(id: string) { return prisma.course.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Classes ───
  async listClasses(tenantId: string, branchId: string, sessionId?: string) {
    const where: Prisma.ClassWhereInput = { tenantId, branchId, deletedAt: null };
    if (sessionId) where.academicSessionId = sessionId;
    return prisma.class.findMany({
      where,
      include: { sections: { where: { deletedAt: null } }, _count: { select: { students: true } } },
      orderBy: { numericLevel: 'asc' },
    });
  }
  async getClass(id: string) {
    return prisma.class.findUnique({
      where: { id },
      include: { sections: { where: { deletedAt: null } }, subjects: { where: { deletedAt: null } } },
    });
  }
  async createClass(data: Prisma.ClassUncheckedCreateInput) { return prisma.class.create({ data }); }
  async updateClass(id: string, data: Prisma.ClassUpdateInput) { return prisma.class.update({ where: { id }, data }); }
  async deleteClass(id: string) { return prisma.class.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Sections ───
  async listSections(classId: string) {
    return prisma.section.findMany({ where: { classId, deletedAt: null }, orderBy: { name: 'asc' } });
  }
  async getSection(id: string) { return prisma.section.findUnique({ where: { id } }); }
  async createSection(data: Prisma.SectionUncheckedCreateInput) { return prisma.section.create({ data }); }
  async updateSection(id: string, data: Prisma.SectionUpdateInput) { return prisma.section.update({ where: { id }, data }); }
  async deleteSection(id: string) { return prisma.section.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Subjects ───
  async listSubjects(tenantId: string, branchId: string, classId?: string) {
    const where: Prisma.SubjectWhereInput = { tenantId, branchId, deletedAt: null };
    if (classId) where.classId = classId;
    return prisma.subject.findMany({ where, orderBy: { name: 'asc' } });
  }
  async getSubject(id: string) { return prisma.subject.findUnique({ where: { id } }); }
  async createSubject(data: Prisma.SubjectUncheckedCreateInput) { return prisma.subject.create({ data }); }
  async updateSubject(id: string, data: Prisma.SubjectUpdateInput) { return prisma.subject.update({ where: { id }, data }); }
  async deleteSubject(id: string) { return prisma.subject.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  // ─── Subject Groups ───
  async listSubjectGroups(tenantId: string, classId: string) {
    return prisma.subjectGroup.findMany({
      where: { tenantId, classId },
      include: { subjectMappings: true },
    });
  }
  async createSubjectGroup(data: { tenantId: string; branchId: string; classId: string; name: string }, subjectIds: string[]) {
    return prisma.subjectGroup.create({
      data: { ...data, subjectMappings: { create: subjectIds.map((id) => ({ subjectId: id })) } },
      include: { subjectMappings: true },
    });
  }
  async deleteSubjectGroup(id: string) { return prisma.subjectGroup.delete({ where: { id } }); }

  // ─── Class Teacher Assignment ───
  async getClassTeacher(tenantId: string, classId: string, sectionId?: string) {
    return prisma.classTeacherAssignment.findFirst({ where: { tenantId, classId, sectionId: sectionId || null } });
  }
  async assignClassTeacher(data: { tenantId: string; branchId: string; classId: string; sectionId?: string; teacherId: string }) {
    return prisma.classTeacherAssignment.upsert({
      where: { tenantId_classId_sectionId: { tenantId: data.tenantId, classId: data.classId, sectionId: data.sectionId || '' } },
      update: { teacherId: data.teacherId },
      create: data,
    });
  }
  async removeClassTeacher(id: string) { return prisma.classTeacherAssignment.delete({ where: { id } }); }
  async listClassTeachers(tenantId: string, branchId: string) {
    return prisma.classTeacherAssignment.findMany({ where: { tenantId, branchId } });
  }

  // ─── Subject Teacher Assignment ───
  async getSubjectTeacher(tenantId: string, classId: string, subjectId: string) {
    return prisma.subjectTeacherAssignment.findFirst({ where: { tenantId, classId, subjectId } });
  }
  async assignSubjectTeacher(data: { tenantId: string; branchId: string; classId: string; subjectId: string; teacherId: string }) {
    return prisma.subjectTeacherAssignment.upsert({
      where: { tenantId_classId_subjectId: { tenantId: data.tenantId, classId: data.classId, subjectId: data.subjectId } },
      update: { teacherId: data.teacherId },
      create: data,
    });
  }
  async removeSubjectTeacher(id: string) { return prisma.subjectTeacherAssignment.delete({ where: { id } }); }
  async listSubjectTeachers(tenantId: string, classId: string) {
    return prisma.subjectTeacherAssignment.findMany({ where: { tenantId, classId } });
  }

  // ─── Promotion Rules ───
  async listPromotionRules(tenantId: string, branchId: string) {
    return prisma.promotionRule.findMany({ where: { tenantId, branchId } });
  }
  async createPromotionRule(data: Prisma.PromotionRuleUncheckedCreateInput) {
    return prisma.promotionRule.create({ data });
  }
  async updatePromotionRule(id: string, data: Prisma.PromotionRuleUpdateInput) {
    return prisma.promotionRule.update({ where: { id }, data });
  }
  async deletePromotionRule(id: string) { return prisma.promotionRule.delete({ where: { id } }); }

  // ─── Calendar Events ───
  async listCalendarEvents(tenantId: string, branchId: string, params?: { startDate?: Date; endDate?: Date; eventType?: string }) {
    const where: Prisma.CalendarEventWhereInput = { tenantId, branchId, deletedAt: null };
    if (params?.eventType) where.eventType = params.eventType;
    if (params?.startDate || params?.endDate) {
      where.startDate = {};
      if (params.startDate) where.startDate.gte = params.startDate;
      if (params.endDate) where.startDate.lte = params.endDate;
    }
    return prisma.calendarEvent.findMany({ where, orderBy: { startDate: 'asc' } });
  }
  async createCalendarEvent(data: Prisma.CalendarEventUncheckedCreateInput) { return prisma.calendarEvent.create({ data }); }
  async updateCalendarEvent(id: string, data: Prisma.CalendarEventUpdateInput) { return prisma.calendarEvent.update({ where: { id }, data }); }
  async deleteCalendarEvent(id: string) { return prisma.calendarEvent.update({ where: { id }, data: { deletedAt: new Date() } }); }
}

export const academicRepository = new AcademicRepository();
