import { z } from 'zod';

// ─── Exam Types ───
export const createExamSchema = z.object({
  name: z.string().min(1).max(150).trim(),
  examType: z.enum(['unit_test', 'mid_term', 'terminal', 'final', 'practical', 'viva', 'mock', 'entrance']),
  academicSessionId: z.string().min(1),
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().optional(),
  totalMarks: z.number().min(1).max(1000),
  passingMarks: z.number().min(0).optional(),
  examDate: z.string().datetime().optional(),
  startTime: z.string().max(10).optional(),
  endTime: z.string().max(10).optional(),
});
export const updateExamSchema = createExamSchema.partial();

// ─── Exam Schedule (batch) ───
export const createExamScheduleSchema = z.object({
  name: z.string().min(1).max(150),
  examType: z.enum(['unit_test', 'mid_term', 'terminal', 'final', 'practical', 'viva', 'mock', 'entrance']),
  academicSessionId: z.string().min(1),
  classId: z.string().min(1),
  exams: z.array(z.object({
    subjectId: z.string().min(1),
    totalMarks: z.number().min(1),
    passingMarks: z.number().min(0).optional(),
    examDate: z.string().datetime(),
    startTime: z.string().max(10).optional(),
    endTime: z.string().max(10).optional(),
  })).min(1),
});

// ─── Marks Entry ───
export const enterMarksSchema = z.object({
  examId: z.string().min(1),
  marks: z.array(z.object({
    studentId: z.string().min(1),
    marksObtained: z.number().min(0),
    remarks: z.string().max(200).optional(),
  })).min(1).max(200),
});

// ─── Grade System ───
export const createGradeSchema = z.object({
  name: z.string().min(1).max(10),
  minMarks: z.number().min(0),
  maxMarks: z.number().min(0),
  gradePoint: z.number().min(0).max(10).optional(),
  description: z.string().max(100).optional(),
});

// ─── Result Publication ───
export const publishResultsSchema = z.object({
  examId: z.string().min(1),
});

// ─── Queries ───
export const examListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  classId: z.string().optional(),
  examType: z.string().optional(),
  status: z.enum(['draft', 'scheduled', 'in_progress', 'completed', 'cancelled', 'published']).optional(),
  academicSessionId: z.string().optional(),
});

export const resultQuerySchema = z.object({
  examId: z.string().optional(),
  studentId: z.string().optional(),
  classId: z.string().optional(),
  status: z.enum(['draft', 'under_review', 'approved', 'published', 'revised']).optional(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type CreateExamScheduleInput = z.infer<typeof createExamScheduleSchema>;
export type EnterMarksInput = z.infer<typeof enterMarksSchema>;
export type CreateGradeInput = z.infer<typeof createGradeSchema>;
export type ExamListQuery = z.infer<typeof examListQuerySchema>;
