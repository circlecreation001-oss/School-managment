import { z } from 'zod';

export const createMaterialSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  description: z.string().max(2000).optional(),
  category: z.enum(['notes', 'pdf', 'ppt', 'video', 'audio', 'link', 'doc']).optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  batchId: z.string().optional(),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  fileType: z.string().max(50).optional(),
  fileSize: z.number().int().optional(),
  externalUrl: z.string().url().optional(),
  visibility: z.enum(['class', 'batch', 'all']).default('class'),
});
export const updateMaterialSchema = createMaterialSchema.partial();

export const materialListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  batchId: z.string().optional(),
  category: z.string().optional(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type MaterialListQuery = z.output<typeof materialListQuerySchema>;
