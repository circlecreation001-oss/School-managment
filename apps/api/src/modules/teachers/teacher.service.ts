import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { teacherRepository } from './teacher.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  CreateTeacherInput, UpdateTeacherInput, AddQualificationInput,
  AddExperienceInput, AssignSubjectsInput, UpdateSalaryInput,
  UploadDocumentInput, TeacherListQuery,
} from './teacher.schema.js';

export class TeacherService {
  async list(tenantId: string, branchId: string, query: TeacherListQuery) {
    const { data, total } = await teacherRepository.list(tenantId, branchId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  async getById(tenantId: string, id: string) {
    const teacher = await teacherRepository.findById(id);
    if (!teacher || teacher.tenantId !== tenantId || teacher.deletedAt) {
      throw new AppError(404, 'NOT_FOUND', 'Teacher not found');
    }
    // Fetch related data
    const [qualifications, experiences, salary, documents] = await Promise.all([
      teacherRepository.getQualifications(id),
      teacherRepository.getExperiences(id),
      teacherRepository.getSalary(id),
      teacherRepository.getDocuments(id),
    ]);
    return { ...teacher, qualifications, experiences, salary, documents };
  }

  async create(tenantId: string, branchId: string, input: CreateTeacherInput, actorId: string) {
    const employeeCode = await teacherRepository.getNextEmployeeCode(tenantId);
    const teacher = await teacherRepository.create({
      tenantId, branchId, employeeCode,
      firstName: input.firstName, lastName: input.lastName,
      email: input.email, phone: input.phone,
      gender: input.gender as any, dob: input.dob ? new Date(input.dob) : undefined,
      departmentId: input.departmentId, designation: input.designation,
      qualification: input.qualification, experience: input.experience,
      joiningDate: input.joiningDate ? new Date(input.joiningDate) : new Date(),
      status: 'active', createdBy: actorId,
    });

    if (input.salary) {
      await teacherRepository.upsertSalary(teacher.id, { teacherId: teacher.id, ...input.salary } as any);
    }

    await this.audit(tenantId, actorId, 'teacher', teacher.id, 'create');
    logger.info({ tenantId, teacherId: teacher.id, employeeCode, actorId }, 'Teacher created');
    return teacher;
  }

  async update(tenantId: string, id: string, input: UpdateTeacherInput, actorId: string) {
    await this.ensureExists(tenantId, id);
    const data: Record<string, unknown> = { updatedBy: actorId };
    const { salary, ...fields } = input;
    Object.entries(fields).forEach(([k, v]) => { if (v !== undefined) data[k] = v; });
    if (data.dob) data.dob = new Date(data.dob as string);
    if (data.joiningDate) data.joiningDate = new Date(data.joiningDate as string);

    const updated = await teacherRepository.update(id, data);
    if (salary) await teacherRepository.upsertSalary(id, { teacherId: id, ...salary } as any);
    await this.audit(tenantId, actorId, 'teacher', id, 'update');
    return updated;
  }

  async archive(tenantId: string, id: string, actorId: string) {
    await this.ensureExists(tenantId, id);
    await teacherRepository.softDelete(id);
    await this.audit(tenantId, actorId, 'teacher', id, 'archive');
    return { message: 'Teacher archived' };
  }

  // ─── Qualifications ───
  async getQualifications(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getQualifications(teacherId);
  }
  async addQualification(tenantId: string, teacherId: string, input: AddQualificationInput, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    const q = await teacherRepository.addQualification({ teacherId, ...input, fromDate: undefined as any, toDate: undefined as any } as any);
    await this.audit(tenantId, actorId, 'teacher_qualification', q.id, 'create');
    return q;
  }
  async deleteQualification(tenantId: string, teacherId: string, qId: string, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    await teacherRepository.deleteQualification(qId);
    await this.audit(tenantId, actorId, 'teacher_qualification', qId, 'delete');
    return { message: 'Qualification removed' };
  }

  // ─── Experiences ───
  async getExperiences(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getExperiences(teacherId);
  }
  async addExperience(tenantId: string, teacherId: string, input: AddExperienceInput, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    const exp = await teacherRepository.addExperience({
      teacherId, organization: input.organization, position: input.position,
      fromDate: new Date(input.fromDate), toDate: input.toDate ? new Date(input.toDate) : undefined,
      isCurrent: input.isCurrent, responsibilities: input.responsibilities, subject: input.subject,
    });
    await this.audit(tenantId, actorId, 'teacher_experience', exp.id, 'create');
    return exp;
  }
  async deleteExperience(tenantId: string, teacherId: string, expId: string, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    await teacherRepository.deleteExperience(expId);
    await this.audit(tenantId, actorId, 'teacher_experience', expId, 'delete');
    return { message: 'Experience removed' };
  }

  // ─── Salary ───
  async getSalary(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getSalary(teacherId);
  }
  async updateSalary(tenantId: string, teacherId: string, input: UpdateSalaryInput, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    const salary = await teacherRepository.upsertSalary(teacherId, { teacherId, ...input } as any);
    await this.audit(tenantId, actorId, 'teacher_salary', teacherId, 'update');
    return salary;
  }

  // ─── Subjects ───
  async assignSubjects(tenantId: string, teacherId: string, input: AssignSubjectsInput, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    const result = await teacherRepository.assignSubjects(teacherId, input.subjectIds);
    await this.audit(tenantId, actorId, 'teacher_subject', teacherId, 'assign', { count: input.subjectIds.length });
    return result;
  }
  async getSubjects(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getSubjects(teacherId);
  }

  // ─── Documents ───
  async getDocuments(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getDocuments(teacherId);
  }
  async addDocument(tenantId: string, teacherId: string, input: UploadDocumentInput, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    const doc = await teacherRepository.addDocument({ tenantId, teacherId, ...input });
    await this.audit(tenantId, actorId, 'teacher_document', doc.id, 'upload');
    return doc;
  }
  async deleteDocument(tenantId: string, teacherId: string, docId: string, actorId: string) {
    await this.ensureExists(tenantId, teacherId);
    await teacherRepository.deleteDocument(docId);
    await this.audit(tenantId, actorId, 'teacher_document', docId, 'delete');
    return { message: 'Document removed' };
  }

  // ─── Timetable & Attendance ───
  async getTimetable(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getTimetable(tenantId, teacherId);
  }
  async getAttendanceSummary(tenantId: string, teacherId: string, month: number, year: number) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getAttendanceSummary(teacherId, month, year);
  }
  async getLeaves(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getLeaves(teacherId);
  }
  async getLeaveStats(tenantId: string, teacherId: string, year: number) {
    await this.ensureExists(tenantId, teacherId);
    return teacherRepository.getLeaveStats(teacherId, year);
  }

  // ─── Timeline ───
  async getTimeline(tenantId: string, teacherId: string) {
    await this.ensureExists(tenantId, teacherId);
    return prisma.auditLog.findMany({
      where: { tenantId, entityId: teacherId, entityType: { startsWith: 'teacher' } },
      orderBy: { createdAt: 'desc' }, take: 50,
    });
  }

  // ─── Helpers ───
  private async ensureExists(tenantId: string, id: string) {
    const t = await teacherRepository.findById(id);
    if (!t || t.tenantId !== tenantId || t.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Teacher not found');
  }
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: metadata || undefined } });
  }
}

export const teacherService = new TeacherService();
