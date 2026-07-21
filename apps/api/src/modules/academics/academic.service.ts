import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { academicRepository } from './academic.repository.js';
import type {
  CreateSessionInput, CreateDepartmentInput, CreateCourseInput,
  CreateClassInput, CreateSectionInput, CreateSubjectInput,
  CreateSubjectGroupInput, AssignClassTeacherInput, AssignSubjectTeacherInput,
  CreatePromotionRuleInput, CreateCalendarEventInput,
} from './academic.schema.js';

export class AcademicService {
  // â”€â”€â”€ SESSIONS â”€â”€â”€
  async listSessions(tenantId: string) { return academicRepository.listSessions(tenantId); }

  async createSession(tenantId: string, input: CreateSessionInput, actorId: string) {
    const session = await academicRepository.createSession({
      tenantId, name: input.name,
      startDate: new Date(input.startDate), endDate: new Date(input.endDate), isCurrent: input.isCurrent,
    });
    if (input.isCurrent) await academicRepository.setCurrentSession(tenantId, session.id);
    await this.audit(tenantId, actorId, 'academic_session', session.id, 'create');
    return session;
  }

  async updateSession(tenantId: string, id: string, input: Partial<CreateSessionInput>, actorId: string) {
    const existing = await academicRepository.getSession(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Session not found');
    const data: Record<string, unknown> = {};
    if (input.name) data.name = input.name;
    if (input.startDate) data.startDate = new Date(input.startDate);
    if (input.endDate) data.endDate = new Date(input.endDate);
    if (input.isCurrent !== undefined) data.isCurrent = input.isCurrent;
    const updated = await academicRepository.updateSession(id, data);
    if (input.isCurrent) await academicRepository.setCurrentSession(tenantId, id);
    await this.audit(tenantId, actorId, 'academic_session', id, 'update');
    return updated;
  }

  async setCurrentSession(tenantId: string, id: string, actorId: string) {
    await academicRepository.setCurrentSession(tenantId, id);
    await this.audit(tenantId, actorId, 'academic_session', id, 'set_current');
    return { message: 'Current session updated' };
  }

  // â”€â”€â”€ DEPARTMENTS â”€â”€â”€
  async listDepartments(tenantId: string, branchId: string) { return academicRepository.listDepartments(tenantId, branchId); }

  async createDepartment(tenantId: string, branchId: string, input: CreateDepartmentInput, actorId: string) {
    const dept = await academicRepository.createDepartment({ tenantId, branchId, name: input.name, code: input.code, headId: input.headId });
    await this.audit(tenantId, actorId, 'department', dept.id, 'create');
    return dept;
  }

  async updateDepartment(tenantId: string, id: string, input: Partial<CreateDepartmentInput>, actorId: string) {
    const existing = await academicRepository.getDepartment(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Department not found');
    const updated = await academicRepository.updateDepartment(id, input);
    await this.audit(tenantId, actorId, 'department', id, 'update');
    return updated;
  }

  async deleteDepartment(tenantId: string, id: string, actorId: string) {
    const existing = await academicRepository.getDepartment(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Department not found');
    await academicRepository.deleteDepartment(id);
    await this.audit(tenantId, actorId, 'department', id, 'delete');
    return { message: 'Department deleted' };
  }

  // â”€â”€â”€ COURSES â”€â”€â”€
  async listCourses(tenantId: string, branchId: string) { return academicRepository.listCourses(tenantId, branchId); }
  async createCourse(tenantId: string, branchId: string, input: CreateCourseInput, actorId: string) {
    const course = await academicRepository.createCourse({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'course', course.id, 'create');
    return course;
  }
  async updateCourse(tenantId: string, id: string, input: Partial<CreateCourseInput>, actorId: string) {
    const existing = await academicRepository.getCourse(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Course not found');
    const updated = await academicRepository.updateCourse(id, input);
    await this.audit(tenantId, actorId, 'course', id, 'update');
    return updated;
  }
  async deleteCourse(tenantId: string, id: string, actorId: string) {
    const existing = await academicRepository.getCourse(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Course not found');
    await academicRepository.deleteCourse(id);
    await this.audit(tenantId, actorId, 'course', id, 'delete');
    return { message: 'Course deleted' };
  }

  // â”€â”€â”€ CLASSES â”€â”€â”€
  async listClasses(tenantId: string, branchId: string, sessionId?: string) { return academicRepository.listClasses(tenantId, branchId, sessionId); }
  async getClass(tenantId: string, id: string) {
    const cls = await academicRepository.getClass(id);
    if (!cls || cls.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Class not found');
    return cls;
  }
  async createClass(tenantId: string, branchId: string, input: CreateClassInput, actorId: string) {
    const cls = await academicRepository.createClass({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'class', cls.id, 'create');
    return cls;
  }
  async updateClass(tenantId: string, id: string, input: Partial<CreateClassInput>, actorId: string) {
    await this.getClass(tenantId, id);
    const updated = await academicRepository.updateClass(id, input);
    await this.audit(tenantId, actorId, 'class', id, 'update');
    return updated;
  }
  async deleteClass(tenantId: string, id: string, actorId: string) {
    await this.getClass(tenantId, id);
    await academicRepository.deleteClass(id);
    await this.audit(tenantId, actorId, 'class', id, 'delete');
    return { message: 'Class deleted' };
  }

  // â”€â”€â”€ SECTIONS â”€â”€â”€
  async listSections(tenantId: string, classId: string) {
    await this.getClass(tenantId, classId);
    return academicRepository.listSections(classId);
  }
  async createSection(tenantId: string, branchId: string, input: CreateSectionInput, actorId: string) {
    const section = await academicRepository.createSection({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'section', section.id, 'create');
    return section;
  }
  async updateSection(tenantId: string, id: string, input: Partial<CreateSectionInput>, actorId: string) {
    const existing = await academicRepository.getSection(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Section not found');
    const updated = await academicRepository.updateSection(id, input);
    await this.audit(tenantId, actorId, 'section', id, 'update');
    return updated;
  }
  async deleteSection(tenantId: string, id: string, actorId: string) {
    const existing = await academicRepository.getSection(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Section not found');
    await academicRepository.deleteSection(id);
    await this.audit(tenantId, actorId, 'section', id, 'delete');
    return { message: 'Section deleted' };
  }

  // â”€â”€â”€ SUBJECTS â”€â”€â”€
  async listSubjects(tenantId: string, branchId: string, classId?: string) { return academicRepository.listSubjects(tenantId, branchId, classId); }
  async createSubject(tenantId: string, branchId: string, input: CreateSubjectInput, actorId: string) {
    const subject = await academicRepository.createSubject({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'subject', subject.id, 'create');
    return subject;
  }
  async updateSubject(tenantId: string, id: string, input: Partial<CreateSubjectInput>, actorId: string) {
    const existing = await academicRepository.getSubject(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Subject not found');
    const updated = await academicRepository.updateSubject(id, input);
    await this.audit(tenantId, actorId, 'subject', id, 'update');
    return updated;
  }
  async deleteSubject(tenantId: string, id: string, actorId: string) {
    const existing = await academicRepository.getSubject(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Subject not found');
    await academicRepository.deleteSubject(id);
    await this.audit(tenantId, actorId, 'subject', id, 'delete');
    return { message: 'Subject deleted' };
  }

  // â”€â”€â”€ SUBJECT GROUPS â”€â”€â”€
  async listSubjectGroups(tenantId: string, classId: string) { return academicRepository.listSubjectGroups(tenantId, classId); }
  async createSubjectGroup(tenantId: string, branchId: string, input: CreateSubjectGroupInput, actorId: string) {
    const group = await academicRepository.createSubjectGroup({ tenantId, branchId, classId: input.classId, name: input.name }, input.subjectIds);
    await this.audit(tenantId, actorId, 'subject_group', group.id, 'create');
    return group;
  }
  async deleteSubjectGroup(tenantId: string, id: string, actorId: string) {
    await academicRepository.deleteSubjectGroup(id);
    await this.audit(tenantId, actorId, 'subject_group', id, 'delete');
    return { message: 'Subject group deleted' };
  }

  // â”€â”€â”€ TEACHER ASSIGNMENTS â”€â”€â”€
  async assignClassTeacher(tenantId: string, branchId: string, input: AssignClassTeacherInput, actorId: string) {
    const result = await academicRepository.assignClassTeacher({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'class_teacher', result.id, 'assign');
    return result;
  }
  async listClassTeachers(tenantId: string, branchId: string) { return academicRepository.listClassTeachers(tenantId, branchId); }

  async assignSubjectTeacher(tenantId: string, branchId: string, input: AssignSubjectTeacherInput, actorId: string) {
    const result = await academicRepository.assignSubjectTeacher({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'subject_teacher', result.id, 'assign');
    return result;
  }
  async listSubjectTeachers(tenantId: string, classId: string) { return academicRepository.listSubjectTeachers(tenantId, classId); }

  // â”€â”€â”€ PROMOTION RULES â”€â”€â”€
  async listPromotionRules(tenantId: string, branchId: string) { return academicRepository.listPromotionRules(tenantId, branchId); }
  async createPromotionRule(tenantId: string, branchId: string, input: CreatePromotionRuleInput, actorId: string) {
    const rule = await academicRepository.createPromotionRule({ tenantId, branchId, ...input } as any);
    await this.audit(tenantId, actorId, 'promotion_rule', rule.id, 'create');
    return rule;
  }
  async deletePromotionRule(tenantId: string, id: string, actorId: string) {
    await academicRepository.deletePromotionRule(id);
    await this.audit(tenantId, actorId, 'promotion_rule', id, 'delete');
    return { message: 'Promotion rule deleted' };
  }

  // â”€â”€â”€ CALENDAR â”€â”€â”€
  async listCalendarEvents(tenantId: string, branchId: string, params?: { startDate?: string; endDate?: string; eventType?: string }) {
    return academicRepository.listCalendarEvents(tenantId, branchId, {
      startDate: params?.startDate ? new Date(params.startDate) : undefined,
      endDate: params?.endDate ? new Date(params.endDate) : undefined,
      eventType: params?.eventType,
    });
  }
  async createCalendarEvent(tenantId: string, branchId: string, input: CreateCalendarEventInput, actorId: string) {
    const event = await academicRepository.createCalendarEvent({
      tenantId, branchId, title: input.title, description: input.description,
      eventType: input.eventType, startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
      isAllDay: input.isAllDay, targetClassIds: input.targetClassIds || undefined,
    });
    await this.audit(tenantId, actorId, 'calendar_event', event.id, 'create');
    return event;
  }
  async updateCalendarEvent(tenantId: string, id: string, input: Partial<CreateCalendarEventInput>, actorId: string) {
    const data: Record<string, unknown> = {};
    if (input.title) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.eventType) data.eventType = input.eventType;
    if (input.startDate) data.startDate = new Date(input.startDate);
    if (input.endDate) data.endDate = new Date(input.endDate);
    if (input.isAllDay !== undefined) data.isAllDay = input.isAllDay;
    const updated = await academicRepository.updateCalendarEvent(id, data);
    await this.audit(tenantId, actorId, 'calendar_event', id, 'update');
    return updated;
  }
  async deleteCalendarEvent(tenantId: string, id: string, actorId: string) {
    await academicRepository.deleteCalendarEvent(id);
    await this.audit(tenantId, actorId, 'calendar_event', id, 'delete');
    return { message: 'Event deleted' };
  }

  // â”€â”€â”€ PRIVATE â”€â”€â”€
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action } });
  }
}

export const academicService = new AcademicService();
