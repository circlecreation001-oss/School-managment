import { z } from 'zod';

// â”€â”€â”€ Admission â”€â”€â”€
export const createAdmissionSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  middleName: z.string().max(100).optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  batchId: z.string().optional(),
  academicSessionId: z.string().min(1),
  admissionDate: z.string().datetime().optional(),
  bloodGroup: z.string().max(5).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  house: z.string().max(50).optional(),
  // Parent / Guardian
  guardian: z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    relation: z.enum(['father', 'mother', 'guardian']),
    phone: z.string().max(20).optional(),
    email: z.string().email().optional(),
    occupation: z.string().max(100).optional(),
    address: z.string().max(500).optional(),
  }).optional(),
  // Medical
  medical: z.object({
    allergies: z.string().max(500).optional(),
    conditions: z.string().max(500).optional(),
    medications: z.string().max(500).optional(),
    emergencyContact: z.string().max(20).optional(),
    emergencyName: z.string().max(100).optional(),
  }).optional(),
});

// â”€â”€â”€ Update Student â”€â”€â”€
export const updateStudentSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  middleName: z.string().max(100).optional(),
  dob: z.string().datetime().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  batchId: z.string().optional(),
  rollNumber: z.string().max(20).optional(),
  bloodGroup: z.string().max(5).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  pincode: z.string().max(10).optional(),
  house: z.string().max(50).optional(),
  status: z.enum(['active', 'inactive', 'pending', 'promoted', 'transferred', 'graduated', 'archived']).optional(),
});

// â”€â”€â”€ Parent / Guardian â”€â”€â”€
export const upsertParentSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  relation: z.enum(['father', 'mother', 'guardian']),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  occupation: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  isPrimary: z.boolean().default(false),
});

// â”€â”€â”€ Medical â”€â”€â”€
export const updateMedicalSchema = z.object({
  allergies: z.string().max(500).optional(),
  conditions: z.string().max(500).optional(),
  medications: z.string().max(500).optional(),
  emergencyContact: z.string().max(20).optional(),
  emergencyName: z.string().max(100).optional(),
  bloodGroup: z.string().max(5).optional(),
});

// â”€â”€â”€ Documents â”€â”€â”€
export const uploadDocumentSchema = z.object({
  documentType: z.string().min(1).max(50),
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().max(100).optional(),
});

// â”€â”€â”€ Promotion â”€â”€â”€
export const promoteStudentsSchema = z.object({
  studentIds: z.array(z.string()).min(1),
  toClassId: z.string().min(1),
  toSectionId: z.string().optional(),
  toAcademicSessionId: z.string().min(1),
});

// â”€â”€â”€ Transfer â”€â”€â”€
export const transferStudentSchema = z.object({
  reason: z.string().max(500).optional(),
  transferDate: z.string().datetime().optional(),
  destinationSchool: z.string().max(200).optional(),
});

// â”€â”€â”€ Bulk Import â”€â”€â”€
export const bulkImportStudentsSchema = z.object({
  students: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dob: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    classId: z.string().min(1),
    sectionId: z.string().optional(),
    guardianName: z.string().optional(),
    guardianPhone: z.string().optional(),
    guardianRelation: z.string().optional(),
  })).min(1).max(500),
});

// â”€â”€â”€ List Query â”€â”€â”€
export const studentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  classId: z.string().optional(),
  sectionId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending', 'promoted', 'transferred', 'graduated', 'archived']).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'admissionNumber', 'rollNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateAdmissionInput = z.infer<typeof createAdmissionSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
export type UpsertParentInput = z.infer<typeof upsertParentSchema>;
export type UpdateMedicalInput = z.infer<typeof updateMedicalSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type PromoteStudentsInput = z.infer<typeof promoteStudentsSchema>;
export type TransferStudentInput = z.infer<typeof transferStudentSchema>;
export type BulkImportStudentsInput = z.infer<typeof bulkImportStudentsSchema>;
export type StudentListQuery = z.output<typeof studentListQuerySchema>;
