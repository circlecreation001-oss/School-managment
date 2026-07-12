import { z } from 'zod';

// ─── Academic Session ───
export const createSessionSchema = z.object({
  name: z.string().min(2).max(50).trim(), // e.g. "2025-2026"
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isCurrent: z.boolean().default(false),
});
export const updateSessionSchema = createSessionSchema.partial();

// ─── Department ───
export const createDepartmentSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_]+$/),
  headId: z.string().optional(),
});
export const updateDepartmentSchema = createDepartmentSchema.partial();

// ─── Course / Stream ───
export const createCourseSchema = z.object({
  name: z.string().min(2).max(150).trim(),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_]+$/),
  departmentId: z.string().optional(),
  duration: z.string().max(50).optional(),
});
export const updateCourseSchema = createCourseSchema.partial();

// ─── Class ───
export const createClassSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  code: z.string().min(1).max(20),
  courseId: z.string().optional(),
  academicSessionId: z.string().min(1),
  numericLevel: z.number().int().min(0).max(20).optional(),
});
export const updateClassSchema = createClassSchema.partial();

// ─── Section ───
export const createSectionSchema = z.object({
  name: z.string().min(1).max(20).trim(),
  code: z.string().min(1).max(20),
  classId: z.string().min(1),
  capacity: z.number().int().min(1).max(500).optional(),
});
export const updateSectionSchema = createSectionSchema.partial().omit({ classId: true });

// ─── Subject ───
export const createSubjectSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  code: z.string().min(1).max(20).regex(/^[A-Z0-9_]+$/),
  classId: z.string().optional(),
  courseId: z.string().optional(),
  departmentId: z.string().optional(),
  academicSessionId: z.string().optional(),
  type: z.enum(['theory', 'practical', 'both']).default('theory'),
});
export const updateSubjectSchema = createSubjectSchema.partial();

// ─── Subject Group ───
export const createSubjectGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  classId: z.string().min(1),
  subjectIds: z.array(z.string()).min(1),
});

// ─── Teacher Assignment ───
export const assignClassTeacherSchema = z.object({
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  teacherId: z.string().min(1),
});

export const assignSubjectTeacherSchema = z.object({
  subjectId: z.string().min(1),
  classId: z.string().min(1),
  teacherId: z.string().min(1),
});

// ─── Promotion Rule ───
export const createPromotionRuleSchema = z.object({
  fromClassId: z.string().min(1),
  toClassId: z.string().min(1),
  minAttendancePercent: z.number().min(0).max(100).optional(),
  minPassPercent: z.number().min(0).max(100).optional(),
  requireFeesClear: z.boolean().default(false),
  autoPromote: z.boolean().default(false),
});

// ─── Academic Calendar Event ───
export const createCalendarEventSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(1000).optional(),
  eventType: z.enum(['holiday', 'exam', 'event', 'meeting', 'deadline', 'other']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  isAllDay: z.boolean().default(true),
  targetClassIds: z.array(z.string()).optional(),
});
export const updateCalendarEventSchema = createCalendarEventSchema.partial();

// ─── Exports ───
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type CreateClassInput = z.infer<typeof createClassSchema>;
export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateSubjectGroupInput = z.infer<typeof createSubjectGroupSchema>;
export type AssignClassTeacherInput = z.infer<typeof assignClassTeacherSchema>;
export type AssignSubjectTeacherInput = z.infer<typeof assignSubjectTeacherSchema>;
export type CreatePromotionRuleInput = z.infer<typeof createPromotionRuleSchema>;
export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>;
