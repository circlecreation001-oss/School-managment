import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class ExamRepository {
  // â”€â”€â”€ Exams â”€â”€â”€
  async listExams(tenantId: string, branchId: string, params: {
    page?: number; limit?: number; classId?: string; examType?: string;
    status?: string; academicSessionId?: string;
  }) {
    const where: Prisma.ExamWhereInput = { tenantId, branchId, deletedAt: null };
    if (params.classId) where.classId = params.classId;
    if (params.examType) where.examType = params.examType;
    if (params.status) where.status = params.status as any;
    if (params.academicSessionId) where.academicSessionId = params.academicSessionId;

    const [data, total] = await Promise.all([
      prisma.exam.findMany({
        where,
        include: {
          class: { select: { name: true } },
          subject: { select: { name: true, code: true } },
          teacher: { select: { firstName: true, lastName: true } },
          _count: { select: { results: true } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { examDate: 'desc' },
      }),
      prisma.exam.count({ where }),
    ]);
    return { data, total };
  }

  async getExam(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
        teacher: { select: { id: true, firstName: true, lastName: true } },
        results: {
          include: { student: { select: { id: true, firstName: true, lastName: true, rollNumber: true, admissionNumber: true } }, grade: true },
          orderBy: { marksObtained: 'desc' },
        },
      },
    });
  }

  async createExam(data: any /* Prisma.ExamUncheckedCreateInput */) { return prisma.exam.create({ data }); }
  async updateExam(id: string, data: any /* Prisma.ExamUpdateInput */) { return prisma.exam.update({ where: { id }, data }); }
  async deleteExam(id: string) { return prisma.exam.update({ where: { id }, data: { deletedAt: new Date(), status: 'cancelled' } }); }

  // â”€â”€â”€ Results â”€â”€â”€
  async upsertResult(data: { tenantId: string; examId: string; studentId: string; marksObtained: number; remarks?: string }) {
    return prisma.result.upsert({
      where: { examId_studentId: { examId: data.examId, studentId: data.studentId } },
      update: { marksObtained: data.marksObtained, remarks: data.remarks },
      create: { ...data, status: 'draft' },
    });
  }

  async getResults(tenantId: string, params: { examId?: string; studentId?: string; classId?: string; status?: string }) {
    const where: Prisma.ResultWhereInput = { tenantId, deletedAt: null };
    if (params.examId) where.examId = params.examId;
    if (params.studentId) where.studentId = params.studentId;
    if (params.status) where.status = params.status as any;
    return prisma.result.findMany({
      where,
      include: {
        exam: { select: { name: true, examType: true, totalMarks: true, subject: { select: { name: true } } } },
        student: { select: { firstName: true, lastName: true, rollNumber: true, admissionNumber: true } },
        grade: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async publishResults(examId: string) {
    return prisma.result.updateMany({
      where: { examId, status: { in: ['draft', 'under_review', 'approved'] } },
      data: { status: 'published', publishedAt: new Date() },
    });
  }

  async getStudentResults(tenantId: string, studentId: string, sessionId?: string) {
    const where: Prisma.ResultWhereInput = { tenantId, studentId, deletedAt: null };
    if (sessionId) where.exam = { academicSessionId: sessionId };
    return prisma.result.findMany({
      where,
      include: { exam: { select: { name: true, examType: true, totalMarks: true, passingMarks: true, subject: { select: { name: true } } } }, grade: true },
      orderBy: { exam: { examDate: 'desc' } },
    });
  }

  // â”€â”€â”€ Grades â”€â”€â”€
  async listGrades(tenantId: string) {
    return prisma.grade.findMany({ where: { tenantId }, orderBy: { minMarks: 'desc' } });
  }
  async createGrade(data: any /* Prisma.GradeUncheckedCreateInput */) { return prisma.grade.create({ data }); }
  async updateGrade(id: string, data: any /* Prisma.GradeUpdateInput */) { return prisma.grade.update({ where: { id }, data }); }
  async deleteGrade(id: string) { return prisma.grade.delete({ where: { id } }); }
  async findGradeForMarks(tenantId: string, percentage: number) {
    return prisma.grade.findFirst({
      where: { tenantId, minMarks: { lte: percentage }, maxMarks: { gte: percentage } },
    });
  }

  // â”€â”€â”€ Analytics â”€â”€â”€
  async getExamAnalytics(tenantId: string, examId: string) {
    const results = await prisma.result.findMany({
      where: { tenantId, examId, deletedAt: null },
      select: { marksObtained: true },
    });
    if (results.length === 0) return { count: 0, highest: 0, lowest: 0, average: 0, passCount: 0, failCount: 0, passPercentage: 0 };

    const marks = results.map((r) => Number(r.marksObtained));
    const exam = await prisma.exam.findUnique({ where: { id: examId }, select: { totalMarks: true, passingMarks: true } });
    const passingMarks = Number(exam?.passingMarks || 0);

    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const average = marks.reduce((a, b) => a + b, 0) / marks.length;
    const passCount = marks.filter((m) => m >= passingMarks).length;
    const failCount = marks.length - passCount;

    return {
      count: results.length, highest, lowest, average: Math.round(average * 100) / 100,
      passCount, failCount, passPercentage: Math.round((passCount / results.length) * 100),
    };
  }

  async getClassPerformance(tenantId: string, classId: string, sessionId: string) {
    return prisma.result.findMany({
      where: { tenantId, deletedAt: null, exam: { classId, academicSessionId: sessionId } },
      include: {
        exam: { select: { name: true, examType: true, totalMarks: true, subject: { select: { name: true } } } },
        student: { select: { id: true, firstName: true, lastName: true, rollNumber: true } },
        grade: true,
      },
    });
  }

  // â”€â”€â”€ Report Card data â”€â”€â”€
  async getReportCardData(tenantId: string, studentId: string, sessionId: string) {
    const results = await prisma.result.findMany({
      where: { tenantId, studentId, deletedAt: null, status: 'published', exam: { academicSessionId: sessionId } },
      include: { exam: { select: { name: true, examType: true, totalMarks: true, passingMarks: true, subject: { select: { name: true } } } }, grade: true },
      orderBy: { exam: { subject: { name: 'asc' } } },
    });
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, admissionNumber: true, rollNumber: true, dob: true, class: { select: { name: true } }, section: { select: { name: true } } },
    });
    return { student, results };
  }
}

export const examRepository = new ExamRepository();
