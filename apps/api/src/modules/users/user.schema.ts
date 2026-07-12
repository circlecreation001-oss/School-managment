import { z } from 'zod';

export const createUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional(),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[a-z]/, 'Must contain lowercase')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
  roleCode: z.string().min(1),
  institutionId: z.string().optional(),
  branchId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional().or(z.literal('')),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'archived']).optional(),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).trim().optional(),
  lastName: z.string().min(1).max(100).trim().optional(),
  phone: z.string().regex(/^\+?[1-9]\d{6,14}$/).optional().or(z.literal('')),
  avatarUrl: z.string().url().optional().or(z.literal('')),
});

export const assignRoleSchema = z.object({
  roleCode: z.string().min(1),
  institutionId: z.string().optional(),
  branchId: z.string().optional(),
});

export const removeRoleSchema = z.object({
  roleId: z.string().min(1),
});

export const bulkImportSchema = z.object({
  users: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().email(),
    phone: z.string().optional(),
    roleCode: z.string().min(1),
    password: z.string().min(8).optional(),
  })).min(1).max(500),
});

export const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'pending', 'archived']).optional(),
  roleCode: z.string().optional(),
  sortBy: z.enum(['createdAt', 'firstName', 'lastName', 'email', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
export type UserListQuery = z.infer<typeof userListQuerySchema>;
