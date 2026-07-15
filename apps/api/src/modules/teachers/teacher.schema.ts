import { z } from 'zod';

export const createTeacherSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  dob: z.string().datetime().optional(),
  departmentId: z.string().optional(),
  designation: z.string().max(100).optional(),
  qualification: z.string().max(200).optional(),
  experience: z.string().max(100).optional(),
  joiningDate: z.string().datetime().optional(),
  // Salary
  salary: z.object({
    basic: z.number().min(0).optional(),
    hra: z.number().min(0).optional(),
    da: z.number().min(0).optional(),
    other: z.number().min(0).optional(),
    deductions: z.number().min(0).optional(),
    bankAccount: z.string().max(30).optional(),
    bankName: z.string().max(100).optional(),
    ifsc: z.string().max(15).optional(),
    panNumber: z.string().max(15).optional(),
  }).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

export const addQualificationSchema = z.object({
  degree: z.string().min(1).max(150),
  institution: z.string().min(1).max(200),
  board: z.string().max(100).optional(),
  year: z.number().int().min(1950).max(2100),
  percentage: z.number().min(0).max(100).optional(),
  specialization: z.string().max(100).optional(),
  documentUrl: z.string().url().optional(),
});

export const addExperienceSchema = z.object({
  organization: z.string().min(1).max(200),
  position: z.string().min(1).max(100),
  fromDate: z.string().datetime(),
  toDate: z.string().datetime().optional(),
  isCurrent: z.boolean().default(false),
  responsibilities: z.string().max(500).optional(),
  subject: z.string().max(100).optional(),
});

export const assignSubjectsSchema = z.object({
  subjectIds: z.array(z.string()).min(1),
});

export const assignClassesSchema = z.object({
  assignments: z.array(z.object({
    classId: z.string().min(1),
    sectionId: z.string().optional(),
    role: z.enum(['class_teacher', 'subject_teacher']).default('subject_teacher'),
  })).min(1),
});

export const updateSalarySchema = z.object({
  basic: z.number().min(0).optional(),
  hra: z.number().min(0).optional(),
  da: z.number().min(0).optional(),
  other: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  bankAccount: z.string().max(30).optional(),
  bankName: z.string().max(100).optional(),
  ifsc: z.string().max(15).optional(),
  panNumber: z.string().max(15).optional(),
});

export const uploadDocumentSchema = z.object({
  documentType: z.string().min(1).max(50),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().max(100).optional(),
});

export const teacherListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  departmentId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'probation', 'on_leave', 'resigned', 'terminated', 'retired']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'employeeCode', 'joiningDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;
export type AddQualificationInput = z.infer<typeof addQualificationSchema>;
export type AddExperienceInput = z.infer<typeof addExperienceSchema>;
export type AssignSubjectsInput = z.infer<typeof assignSubjectsSchema>;
export type AssignClassesInput = z.infer<typeof assignClassesSchema>;
export type UpdateSalaryInput = z.infer<typeof updateSalarySchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type TeacherListQuery = z.output<typeof teacherListQuerySchema>;
