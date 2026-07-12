import { z } from 'zod';

// ─── Mark Attendance (bulk for a class) ───
export const markBulkAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  records: z.array(z.object({
    studentId: z.string().min(1),
    status: z.enum(['present', 'absent', 'late', 'half_day', 'leave']),
    remarks: z.string().max(200).optional(),
  })).min(1).max(200),
});

// ─── Mark Single Student ───
export const markSingleAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'leave']),
  remarks: z.string().max(200).optional(),
});

// ─── Teacher / Staff Attendance ───
export const markTeacherAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(z.object({
    teacherId: z.string().min(1),
    status: z.enum(['present', 'absent', 'late', 'half_day', 'leave', 'holiday']),
    remarks: z.string().max(200).optional(),
  })).min(1).max(100),
});

export const markStaffAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  records: z.array(z.object({
    staffId: z.string().min(1),
    status: z.enum(['present', 'absent', 'late', 'half_day', 'leave', 'holiday']),
    remarks: z.string().max(200).optional(),
  })).min(1).max(100),
});

// ─── QR / Biometric check-in ───
export const qrCheckInSchema = z.object({
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  staffId: z.string().optional(),
  method: z.enum(['qr', 'biometric', 'rfid']).default('qr'),
  timestamp: z.string().datetime().optional(),
});

// ─── Query schemas ───
export const dailyAttendanceQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
});

export const monthlyReportQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
});

export const analyticsQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  classId: z.string().optional(),
  type: z.enum(['student', 'teacher', 'staff']).default('student'),
});

export type MarkBulkAttendanceInput = z.infer<typeof markBulkAttendanceSchema>;
export type MarkSingleAttendanceInput = z.infer<typeof markSingleAttendanceSchema>;
export type MarkTeacherAttendanceInput = z.infer<typeof markTeacherAttendanceSchema>;
export type MarkStaffAttendanceInput = z.infer<typeof markStaffAttendanceSchema>;
export type QrCheckInInput = z.infer<typeof qrCheckInSchema>;
export type DailyAttendanceQuery = z.infer<typeof dailyAttendanceQuerySchema>;
export type MonthlyReportQuery = z.infer<typeof monthlyReportQuerySchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
