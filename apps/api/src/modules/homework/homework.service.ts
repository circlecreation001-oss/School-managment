import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { homeworkRepository } from './homework.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreateHomeworkInput, UpdateHomeworkInput, SubmitHomeworkInput, ReviewSubmissionInput, HomeworkListQuery } from './homework.schema.js';

export class HomeworkService {
  async list(tenantId: string, query: HomeworkListQuery) {
    const { data, total } = await homeworkRepository.list(tenantId, query);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async getById(tenantId: string, id: string) {
    const hw = await homeworkRepository.getById(id);
    if (!hw || hw.tenantId !== tenantId || hw.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Homework not found');
    return hw;
  }

  async create(tenantId: string, teacherId: string, input: CreateHomeworkInput, actorId: string) {
    const hw = await homeworkRepository.create({
      tenantId, teacherId, classId: input.classId, subjectId: input.subjectId,
      title: input.title, description: input.description, instructions: input.instructions,
      maxMarks: input.maxMarks, dueDate: new Date(input.dueDate),
      publishDate: input.publishDate ? new Date(input.publishDate) : new Date(),
      status: 'published',
    });
    if (input.attachments) {
      for (const att of input.attachments) {
        await homeworkRepository.addAttachment({ homeworkId: hw.id, ...att });
      }
    }
    await this.audit(tenantId, actorId, 'homework', hw.id, 'create');
    return hw;
  }

  async update(tenantId: string, id: string, input: UpdateHomeworkInput, actorId: string) {
    await this.getById(tenantId, id);
    const data: Record<string, unknown> = {};
    if (input.title) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.instructions !== undefined) data.instructions = input.instructions;
    if (input.maxMarks !== undefined) data.maxMarks = input.maxMarks;
    if (input.dueDate) data.dueDate = new Date(input.dueDate);
    const updated = await homeworkRepository.update(id, data);
    await this.audit(tenantId, actorId, 'homework', id, 'update');
    return updated;
  }

  async delete(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await homeworkRepository.delete(id);
    await this.audit(tenantId, actorId, 'homework', id, 'delete');
    return { message: 'Homework deleted' };
  }

  async publish(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await homeworkRepository.update(id, { status: 'published', publishDate: new Date() });
    await this.audit(tenantId, actorId, 'homework', id, 'publish');
    return { message: 'Homework published' };
  }

  async close(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await homeworkRepository.update(id, { status: 'closed' });
    await this.audit(tenantId, actorId, 'homework', id, 'close');
    return { message: 'Homework closed' };
  }

  // ─── SUBMISSIONS ───
  async submit(tenantId: string, homeworkId: string, studentId: string, input: SubmitHomeworkInput) {
    const hw = await this.getById(tenantId, homeworkId);
    if (hw.status !== 'published') throw new AppError(400, 'BAD_REQUEST', 'Homework is not open for submissions');

    const existing = await homeworkRepository.getSubmission(homeworkId, studentId);
    const now = new Date();
    const isLate = now > new Date(hw.dueDate);
    const status = isLate ? 'late' : 'submitted';

    if (existing) {
      const updated = await homeworkRepository.updateSubmission(existing.id, { content: input.content, fileUrl: input.fileUrl, fileName: input.fileName, submittedAt: now, status });
      return updated;
    }
    const sub = await homeworkRepository.createSubmission({ tenantId, homeworkId, studentId, content: input.content, fileUrl: input.fileUrl, fileName: input.fileName, submittedAt: now, status });
    return sub;
  }

  async review(tenantId: string, submissionId: string, input: ReviewSubmissionInput, actorId: string) {
    const sub = await prisma.submission.findUnique({ where: { id: submissionId } });
    if (!sub || sub.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Submission not found');

    const updated = await homeworkRepository.updateSubmission(submissionId, {
      marksObtained: input.marksObtained, remarks: input.remarks, status: input.status,
      reviewedBy: actorId, reviewedAt: new Date(),
    });
    await this.audit(tenantId, actorId, 'submission', submissionId, 'review');
    return updated;
  }

  async getSubmissions(tenantId: string, homeworkId: string) {
    await this.getById(tenantId, homeworkId);
    return homeworkRepository.getSubmissions(homeworkId);
  }

  async getStudentSubmissions(tenantId: string, studentId: string) {
    return homeworkRepository.getStudentSubmissions(tenantId, studentId);
  }

  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string, action: string) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action } });
  }
}

export const homeworkService = new HomeworkService();
