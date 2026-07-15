import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class HomeworkRepository {
  async list(tenantId: string, params: { page?: number; limit?: number; classId?: string; subjectId?: string; status?: string; teacherId?: string }) {
    const where: Prisma.HomeworkWhereInput = { tenantId, deletedAt: null };
    if (params.classId) where.classId = params.classId;
    if (params.subjectId) where.subjectId = params.subjectId;
    if (params.status) where.status = params.status as any;
    if (params.teacherId) where.teacherId = params.teacherId;
    const [data, total] = await Promise.all([
      prisma.homework.findMany({ where, include: { class: { select: { name: true } }, subject: { select: { name: true } }, teacher: { select: { firstName: true, lastName: true } }, _count: { select: { submissions: true } } }, skip: ((params.page || 1) - 1) * (params.limit || 20), take: params.limit || 20, orderBy: { dueDate: 'desc' } }),
      prisma.homework.count({ where }),
    ]);
    return { data, total };
  }

  async getById(id: string) {
    return prisma.homework.findUnique({ where: { id }, include: { class: { select: { name: true } }, subject: { select: { name: true } }, teacher: { select: { firstName: true, lastName: true } }, attachments: true, submissions: { include: { student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } } }, orderBy: { submittedAt: 'desc' } } } });
  }

  async create(data: any /* Prisma.HomeworkUncheckedCreateInput */) { return prisma.homework.create({ data }); }
  async update(id: string, data: any /* Prisma.HomeworkUpdateInput */) { return prisma.homework.update({ where: { id }, data }); }
  async delete(id: string) { return prisma.homework.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  async addAttachment(data: any /* Prisma.HomeworkAttachmentUncheckedCreateInput */) { return prisma.homeworkAttachment.create({ data }); }

  // Submissions
  async getSubmission(homeworkId: string, studentId: string) { return prisma.submission.findUnique({ where: { homeworkId_studentId: { homeworkId, studentId } } }); }
  async createSubmission(data: any /* Prisma.SubmissionUncheckedCreateInput */) { return prisma.submission.create({ data }); }
  async updateSubmission(id: string, data: any /* Prisma.SubmissionUpdateInput */) { return prisma.submission.update({ where: { id }, data }); }

  async getSubmissions(homeworkId: string) {
    return prisma.submission.findMany({ where: { homeworkId }, include: { student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } } }, orderBy: { submittedAt: 'desc' } });
  }

  async getStudentSubmissions(tenantId: string, studentId: string) {
    return prisma.submission.findMany({ where: { tenantId, studentId }, include: { homework: { select: { title: true, dueDate: true, maxMarks: true, subject: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } });
  }
}

export const homeworkRepository = new HomeworkRepository();
