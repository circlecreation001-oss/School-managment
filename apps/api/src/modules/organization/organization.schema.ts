import { z } from 'zod';

// ─── Organization CRUD ───
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
  type: z.enum(['school', 'college', 'coaching', 'computer_institute', 'skill_center']).optional(),
  domain: z.string().max(200).optional().or(z.literal('')),
  planCode: z.string().optional(),
  trialDays: z.number().int().min(0).max(90).default(14),
  contact: z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
  }).optional(),
  address: z.object({
    street: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).default('India'),
    pincode: z.string().max(10).optional(),
  }).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  type: z.enum(['school', 'college', 'coaching', 'computer_institute', 'skill_center']).optional(),
  domain: z.string().max(200).optional().or(z.literal('')),
  status: z.enum(['trial', 'active', 'suspended', 'expired', 'cancelled', 'archived']).optional(),
  contact: z.object({
    name: z.string().max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().max(20).optional(),
  }).optional(),
  address: z.object({
    street: z.string().max(300).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    pincode: z.string().max(10).optional(),
  }).optional(),
});

// ─── Branding ───
export const updateBrandingSchema = z.object({
  brandingName: z.string().max(200).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  darkLogoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  secondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  timezone: z.string().max(50).optional(),
  currency: z.string().max(5).optional(),
  currencySymbol: z.string().max(5).optional(),
  language: z.string().max(10).optional(),
  dateFormat: z.string().max(20).optional(),
});

// ─── Subscription ───
export const assignSubscriptionSchema = z.object({
  planCode: z.string().min(1),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']),
  startDate: z.string().datetime().optional(),
});

export const renewSubscriptionSchema = z.object({
  months: z.number().int().min(1).max(36).default(12),
});

// ─── Organization Config ───
export const updateConfigSchema = z.object({
  module: z.enum(['general', 'attendance', 'examination', 'fees', 'notifications', 'email', 'sms', 'whatsapp']),
  settings: z.record(z.string()),
});

export const batchConfigSchema = z.array(z.object({
  module: z.string(),
  key: z.string(),
  value: z.string(),
}));

// ─── Organization Admin ───
export const createOrgAdminSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().toLowerCase().trim(),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128)
    .regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

// ─── Plan Management ───
export const createPlanSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[a-z0-9_]+$/),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0),
  currency: z.string().default('INR'),
  billingCycle: z.enum(['monthly', 'quarterly', 'annual']),
  maxStudents: z.number().int().min(-1).default(-1),
  maxTeachers: z.number().int().min(-1).default(-1),
  maxBranches: z.number().int().min(-1).default(1),
  maxStorage: z.number().min(-1).default(5),
  features: z.record(z.boolean()).optional(),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = createPlanSchema.partial().omit({ code: true });

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type AssignSubscriptionInput = z.infer<typeof assignSubscriptionSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
export type CreateOrgAdminInput = z.infer<typeof createOrgAdminSchema>;
export type CreatePlanInput = z.infer<typeof createPlanSchema>;
