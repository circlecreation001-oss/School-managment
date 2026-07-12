import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { examRepository } from './exam.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreateExamInput, CreateExamScheduleInput, EnterMarksInput, CreateGradeInput, ExamListQuery } from './exam.schema.js';

export class ExamService {
  // ─── EXAMS ───
  async listExams(tenantId: string, branchId: string, query: ExamListQuery) {
    const { data, total } = await examRepository.listExams(tenantId, branchId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  async getExam(tenantId: string, id: string) {
    const exam = await examRepository.getExam(id);
    if (!exam || exam.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
    return exam;
  }

  async createExam(tenantId: string, branchId: string, input: CreateExamInput, actorId: string) {
    const exam = await examRepository.createExam({
      tenantId, branchId, ...input,
      examDate: input.examDate ? new Date(input.examDate) : undefined,
      status: 'scheduled',
    });
    await this.audit(tenantId, actorId, 'exam', exam.id, 'create');
    return exam;
  }

  async createExamSchedule(tenantId: string, branchId: string, input: CreateExamScheduleInput, actorId: string) {
    const created: string[] = [];
    for (const e of input.exams) {
      const exam = await examRepository.createExam({
        tenantId, branchId, name: `${input.name} - ${e.subjectId}`,
        examType: input.examType, academicSessionId: input.academicSessionId,
        classId: input.classId, subjectId: e.subjectId,
        totalMarks: e.totalMarks, passingMarks: e.passingMarks,
        examDate: new Date(e.examDate), startTime: e.startTime, endTime: e.endTime,
        status: 'scheduled',
      });
      created.push(exam.id);
    }
    await this.audit(tenantId, actorId, 'exam', null, 'create_schedule', { count: created.length });
    return { created: created.length, examIds: created };
  }

  async updateExam(tenantId: string, id: string, input: Partial<CreateExamInput>, actorId: string) {
    const existing = await examRepository.getExam(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
    const data: Record<string, unknown> = {};
    Object.entries(input).forEach(([k, v]) => { if (v !== undefined) data[k] = v; });
    if (data.examDate) data.examDate = new Date(data.examDate as string);
    const updated = await examRepository.updateExam(id, data);
    await this.audit(tenantId, actorId, 'exam', id, 'update');
    return updated;
  }

  async deleteExam(tenantId: string, id: string, actorId: string) {
    const existing = await examRepository.getExam(id);
    if (!existing || existing.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Exam not found');
    await examRepository.deleteExam(id);
    await this.audit(tenantId, actorId, 'exam', id, 'delete');
    return { message: 'Exam cancelled' };
  }

  // ─── MARKS ENTRY ───
  async enterMarks(tenantId: string, input: EnterMarksInput, actorId: string) {
    const exam = await examRepository.getExam(input.examId);
    if (!exam || exam.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Exam not found');

    let entered = 0;
    for (const m of input.marks) {
      if (m.marksObtained > Number(exam.totalMarks)) {
        throw new AppError(400, 'BAD_REQUEST', `Marks ${m.marksObtained} exceed total ${exam.totalMarks} for student ${m.studentId}`);
      }
      // Auto-assign grade
      const percentage = (m.marksObtained / Number(exam.totalMarks)) * 100;
      const grade = await examRepository.findGradeForMarks(tenantId, percentage);

      await prisma.result.upsert({
        where: { examId_studentId: { examId: input.examId, studentId: m.studentId } },
        update: { marksObtained: m.marksObtained, remarks: m.remarks, gradeId: grade?.id, percentage, status: 'draft' },
        create: { tenantId, examId: input.examId, studentId: m.studentId, marksObtained: m.marksObtained, remarks: m.remarks, gradeId: grade?.id, percentage, status: 'draft' },
      });
      entered++;
    }

    // Update exam status
    await examRepository.updateExam(input.examId, { status: 'completed' });
    await this.audit(tenantId, actorId, 'result', input.examId, 'enter_marks', { count: entered });
    logger.info({ tenantId, examId: input.examId, entered, actorId }, 'Marks entered');
    return { entered, examId: input.examId };
  }

  // ─── PUBLISH ───
  async publishResults(tenantId: string, examId: string, actorId: string) {
    const exam = await examRepository.getExam(examId);
    if (!exam || exam.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Exam not found');

    await examRepository.publishResults(examId);
    await examRepository.updateExam(examId, { status: 'published' });
    await this.audit(tenantId, actorId, 'result', examId, 'publish');
    return { message: 'Results published' };
  }

  // ─── RESULTS ───
  async getResults(tenantId: string, params: { examId?: string; studentId?: string; classId?: string; status?: string }) {
    return examRepository.getResults(tenantId, params);
  }

  async getStudentResults(tenantId: string, studentId: string, sessionId?: string) {
    return examRepository.getStudentResults(tenantId, studentId, sessionId);
  }

  // ─── GRADES ───
  async listGrades(tenantId: string) { return examRepository.listGrades(tenantId); }
  async createGrade(tenantId: string, input: CreateGradeInput, actorId: string) {
    const grade = await examRepository.createGrade({ tenantId, ...input });
    await this.audit(tenantId, actorId, 'grade', grade.id, 'create');
    return grade;
  }
  async deleteGrade(tenantId: string, id: string, actorId: string) {
    await examRepository.deleteGrade(id);
    await this.audit(tenantId, actorId, 'grade', id, 'delete');
    return { message: 'Grade deleted' };
  }

  // ─── ANALYTICS ───
  async getExamAnalytics(tenantId: string, examId: string) {
    return examRepository.getExamAnalytics(tenantId, examId);
  }

  async getClassPerformance(tenantId: string, classId: string, sessionId: string) {
    return examRepository.getClassPerformance(tenantId, classId, sessionId);
  }

  // ─── REPORT CARD ───
  async getReportCard(tenantId: string, studentId: string, sessionId: string) {
    const data = await examRepository.getReportCardData(tenantId, studentId, sessionId);
    if (!data.student) throw new AppError(404, 'NOT_FOUND', 'Student not found');

    // Calculate aggregates
    const totalMarks = data.results.reduce((sum, r) => sum + Number(r.exam.totalMarks), 0);
    const obtainedMarks = data.results.reduce((sum, r) => sum + Number(r.marksObtained), 0);
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100 : 0;
    const gpa = data.results.length > 0
      ? Math.round((data.results.filter((r) => r.grade?.gradePoint).reduce((sum, r) => sum + Number(r.grade!.gradePoint), 0) / data.results.length) * 100) / 100
      : 0;

    return { ...data, totalMarks, obtainedMarks, percentage, gpa };
  }

  // ─── PRIVATE ───
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: metadata || undefined } });
  }
}

export const examService = new ExamService();
