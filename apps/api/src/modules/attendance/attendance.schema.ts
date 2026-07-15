import { z } from 'zod';

// â”€â”€â”€ Mark Attendance (bulk for a class) â”€â”€â”€
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

// â”€â”€â”€ Mark Single Student â”€â”€â”€
export const markSingleAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['present', 'absent', 'late', 'half_day', 'leave']),
  remarks: z.string().max(200).optional(),
});

// â”€â”€â”€ Teacher / Staff Attendance â”€â”€â”€
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

// â”€â”€â”€ QR / Biometric check-in â”€â”€â”€
export const qrCheckInSchema = z.object({
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  staffId: z.string().optional(),
  method: z.enum(['qr', 'biometric', 'rfid']).default('qr'),
  timestamp: z.string().datetime().optional(),
});

// â”€â”€â”€ Query schemas â”€â”€â”€
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
export type DailyAttendanceQuery = z.output<typeof dailyAttendanceQuerySchema>;
export type MonthlyReportQuery = z.output<typeof monthlyReportQuerySchema>;
export type AnalyticsQuery = z.output<typeof analyticsQuerySchema>;
