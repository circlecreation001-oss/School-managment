import { z } from 'zod';

// ─── Send Notification ───
export const sendNotificationSchema = z.object({
  recipientIds: z.array(z.string()).min(1).max(500),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  data: z.record(z.unknown()).optional(),
  entityType: z.string().max(50).optional(),
  entityId: z.string().optional(),
});

// ─── Broadcast ───
export const broadcastSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  targetType: z.enum(['all', 'role', 'class', 'branch']),
  targetValue: z.string().optional(), // role code, class ID, branch ID
  scheduledAt: z.string().datetime().optional(),
});

// ─── Template ───
export const createTemplateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  code: z.string().min(1).max(50).regex(/^[a-z0-9_]+$/),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  variables: z.array(z.string()).optional(),
});
export const updateTemplateSchema = createTemplateSchema.partial().omit({ code: true, channel: true });

// ─── Send via Template ───
export const sendFromTemplateSchema = z.object({
  templateCode: z.string().min(1),
  recipientIds: z.array(z.string()).min(1).max(500),
  variables: z.record(z.string()).optional(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
});

// ─── Schedule ───
export const scheduleNotificationSchema = z.object({
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app']),
  subject: z.string().max(200).optional(),
  body: z.string().min(1).max(5000),
  recipientIds: z.array(z.string()).min(1).max(500),
  scheduledAt: z.string().datetime(),
});

// ─── Query ───
export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  channel: z.enum(['email', 'sms', 'whatsapp', 'push', 'in_app']).optional(),
  status: z.enum(['pending', 'queued', 'sent', 'delivered', 'failed', 'expired']).optional(),
  recipientId: z.string().optional(),
});

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
export type SendFromTemplateInput = z.infer<typeof sendFromTemplateSchema>;
export type ScheduleNotificationInput = z.infer<typeof scheduleNotificationSchema>;
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;
