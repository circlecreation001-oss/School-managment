import { z } from 'zod';

export const createHomeworkSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(5000).optional(),
  instructions: z.string().max(2000).optional(),
  maxMarks: z.number().min(0).max(1000).optional(),
  dueDate: z.string().datetime(),
  publishDate: z.string().datetime().optional(),
  attachments: z.array(z.object({ fileName: z.string(), fileUrl: z.string().url(), fileSize: z.number().optional(), mimeType: z.string().optional() })).optional(),
});
export const updateHomeworkSchema = createHomeworkSchema.partial();

export const submitHomeworkSchema = z.object({
  content: z.string().max(5000).optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
});

export const reviewSubmissionSchema = z.object({
  marksObtained: z.number().min(0).optional(),
  remarks: z.string().max(1000).optional(),
  status: z.enum(['reviewed', 'graded', 'resubmit_requested']),
});

export const homeworkListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  status: z.enum(['draft', 'published', 'closed', 'archived']).optional(),
  teacherId: z.string().optional(),
});

export type CreateHomeworkInput = z.infer<typeof createHomeworkSchema>;
export type UpdateHomeworkInput = z.infer<typeof updateHomeworkSchema>;
export type SubmitHomeworkInput = z.infer<typeof submitHomeworkSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type HomeworkListQuery = z.output<typeof homeworkListQuerySchema>;
