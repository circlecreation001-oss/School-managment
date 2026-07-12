import { z } from 'zod';

// ─── Tenant / Organization ───
export const createTenantSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  domain: z.string().url().optional().or(z.literal('')),
  planCode: z.enum(['starter', 'growth', 'premium', 'enterprise']).optional(),
  trialDays: z.number().int().min(0).max(90).optional().default(14),
  contactName: z.string().min(1).max(100).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(20).optional(),
});

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  domain: z.string().optional().or(z.literal('')),
  planCode: z.enum(['starter', 'growth', 'premium', 'enterprise']).optional(),
  status: z.enum(['trial', 'active', 'suspended', 'expired', 'cancelled', 'archived']).optional(),
});

export const tenantBrandingSchema = z.object({
  brandingName: z.string().max(200).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  darkLogoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// ─── Plans ───
export const createPlanSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']),
  features: z.record(z.boolean()).optional(),
  limits: z.object({
    maxStudents: z.number().int().min(-1).optional(),
    maxTeachers: z.number().int().min(-1).optional(),
    maxBranches: z.number().int().min(-1).optional(),
    storageGb: z.number().min(-1).optional(),
  }).optional(),
  isActive: z.boolean().default(true),
});

// ─── User management ───
export const updateUserStatusSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']),
  reason: z.string().max(500).optional(),
});

// ─── Platform settings ───
export const updatePlatformSettingsSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
  description: z.string().max(500).optional(),
});

// ─── Announcements ───
export const createAnnouncementSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(1).max(5000),
  targetType: z.enum(['all', 'specific_tenants', 'plan_based']),
  targetTenantIds: z.array(z.string()).optional(),
  targetPlan: z.string().optional(),
  channels: z.array(z.enum(['in_app', 'email', 'sms', 'whatsapp'])).min(1),
  scheduledAt: z.string().datetime().optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantBrandingInput = z.infer<typeof tenantBrandingSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
