import { Request, Response, NextFunction } from 'express';
import { examService } from './exam.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';
import { generateReportCardPDF, generateExamResultSheetPDF } from '../../utils/pdf.js';
import { prisma } from '@erp/database';

export class ExamController {
  async listExams(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      const result = await examService.listExams(req.user!.tenantId, branchId, req.query as any);
      sendList(res, result.data, result.meta);
    } catch (e) { next(e); }
  }
  async getExam(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getExam(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async createExam(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      sendCreated(res, await examService.createExam(req.user!.tenantId, branchId, req.body, req.user!.id));
    } catch (e) { next(e); }
  }
  async createSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const branchId = req.query.branchId as string || req.user!.branchId || '';
      sendCreated(res, await examService.createExamSchedule(req.user!.tenantId, branchId, req.body, req.user!.id));
    } catch (e) { next(e); }
  }
  async updateExam(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.updateExam(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteExam(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.deleteExam(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Marks
  async enterMarks(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.enterMarks(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async publishResults(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.publishResults(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Results
  async getResults(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getResults(req.user!.tenantId, req.query as any)); } catch (e) { next(e); }
  }
  async getStudentResults(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getStudentResults(req.user!.tenantId, req.params.studentId!, req.query.sessionId as string)); } catch (e) { next(e); }
  }

  // Grades
  async listGrades(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.listGrades(req.user!.tenantId)); } catch (e) { next(e); }
  }
  async createGrade(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await examService.createGrade(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteGrade(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.deleteGrade(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Analytics & Report Card
  async getExamAnalytics(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getExamAnalytics(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async getClassPerformance(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getClassPerformance(req.user!.tenantId, req.query.classId as string, req.query.sessionId as string)); } catch (e) { next(e); }
  }
  async getReportCard(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await examService.getReportCard(req.user!.tenantId, req.params.studentId!, req.query.sessionId as string)); } catch (e) { next(e); }
  }

  // PDF Downloads
  async downloadReportCardPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await examService.getReportCard(req.user!.tenantId, req.params.studentId!, req.query.sessionId as string);
      const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId }, select: { name: true } });

      const doc = generateReportCardPDF({
        studentName: `${data.student.firstName} ${data.student.lastName}`,
        admissionNumber: data.student.admissionNumber,
        className: data.student.class?.name,
        rollNumber: data.student.rollNumber,
        results: data.results.map((r: any) => ({
          subject: r.exam.subject?.name || r.exam.name,
          marks: Number(r.marksObtained),
          total: Number(r.exam.totalMarks),
          grade: r.grade?.name || '-',
        })),
        instituteName: tenant?.name,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="report-card-${data.student.admissionNumber}.pdf"`);
      doc.pipe(res);
      doc.end();
    } catch (e) { next(e); }
  }

  async downloadResultSheetPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const exam = await examService.getExam(req.user!.tenantId, req.params.examId!);
      const results = await examService.getResults(req.user!.tenantId, { examId: req.params.examId! });
      const tenant = await prisma.tenant.findUnique({ where: { id: req.user!.tenantId }, select: { name: true } });

      const doc = generateExamResultSheetPDF({
        examName: exam.name,
        className: exam.class?.name,
        subjectName: exam.subject?.name,
        results: results.map((r: any) => ({
          studentName: `${r.student.firstName} ${r.student.lastName}`,
          rollNumber: r.student.rollNumber,
          marks: Number(r.marksObtained),
          total: Number(r.exam.totalMarks),
          grade: r.grade?.name || '-',
          percentage: r.percentage,
        })),
        instituteName: tenant?.name,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="result-sheet-${exam.name}.pdf"`);
      doc.pipe(res);
      doc.end();
    } catch (e) { next(e); }
  }
}

export const examController = new ExamController();
