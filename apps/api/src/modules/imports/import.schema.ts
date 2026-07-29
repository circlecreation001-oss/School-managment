import { z } from 'zod';

export const importEntities = [
  'students', 'teachers', 'staff', 'parents', 'classes', 'sections', 'subjects',
  'fees', 'attendance', 'exams', 'results', 'library', 'transport', 'hostel', 'payroll', 'inventory', 'admissions',
] as const;

export const duplicateActions = ['skip', 'update', 'create_new'] as const;

export const startImportSchema = z.object({
  entity: z.enum(importEntities),
  mappings: z.record(z.string(), z.string()).optional(),
  duplicateAction: z.enum(duplicateActions).default('skip'),
  autoCreate: z.boolean().default(true),
});

export const validateImportSchema = z.object({
  entity: z.enum(importEntities),
  data: z.array(z.record(z.string(), z.any())),
  mappings: z.record(z.string(), z.string()).optional(),
});

export type StartImportInput = z.infer<typeof startImportSchema>;
export type ValidateImportInput = z.infer<typeof validateImportSchema>;
