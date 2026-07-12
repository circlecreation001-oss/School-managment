import { z } from 'zod';

export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  branchId: z.string().optional(),
});

export const attendanceReportSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().optional(),
  type: z.enum(['student', 'teacher', 'staff']).default('student'),
  groupBy: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

export const feeReportSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().optional(),
  status: z.enum(['paid', 'partially_paid', 'overdue', 'issued']).optional(),
});

export const studentReportSchema = z.object({
  classId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'transferred', 'graduated', 'archived']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const exportSchema = z.object({
  reportType: z.enum(['attendance', 'fees', 'students', 'teachers', 'revenue', 'exam_results']),
  format: z.enum(['pdf', 'excel', 'csv']).default('excel'),
  filters: z.record(z.string()).optional(),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type AttendanceReportInput = z.infer<typeof attendanceReportSchema>;
export type FeeReportInput = z.infer<typeof feeReportSchema>;
export type StudentReportInput = z.infer<typeof studentReportSchema>;
export type ExportInput = z.infer<typeof exportSchema>;
