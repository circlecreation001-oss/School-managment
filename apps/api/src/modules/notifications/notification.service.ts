import { AppError } from '../../utils/errors.js';
import { logger, notificationQueue, emitToUser } from '../../config/index.js';
import { prisma } from '@erp/database';
import { notificationRepository } from './notification.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  SendNotificationInput, BroadcastInput, CreateTemplateInput, UpdateTemplateInput,
  SendFromTemplateInput, ScheduleNotificationInput, NotificationListQuery,
} from './notification.schema.js';

export class NotificationService {
  // â”€â”€â”€ SEND â”€â”€â”€
  async send(tenantId: string, input: SendNotificationInput, actorId: string) {
    const notifications = input.recipientIds.map((recipientId) => ({
      tenantId, recipientId, channel: input.channel as any, subject: input.subject,
      body: input.body, data: (input.data as any), entityType: input.entityType, entityId: input.entityId,
      status: 'queued' as const,
    }));

    await notificationRepository.createMany(notifications);

    // Queue for async delivery
    for (const recipientId of input.recipientIds) {
      await notificationQueue.add('send', {
        tenantId, recipientId, channel: input.channel,
        subject: input.subject, body: input.body, data: (input.data as any),
      });

      // Real-time for in_app
      if (input.channel === 'in_app') {
        emitToUser(recipientId, 'notification:new', { subject: input.subject, body: input.body });
      }
    }

    logger.info({ tenantId, channel: input.channel, count: input.recipientIds.length, actorId }, 'Notifications queued');
    return { queued: input.recipientIds.length, channel: input.channel };
  }

  // â”€â”€â”€ SEND FROM TEMPLATE â”€â”€â”€
  async sendFromTemplate(tenantId: string, input: SendFromTemplateInput, actorId: string) {
    const template = await notificationRepository.findTemplateByCode(tenantId, input.templateCode, 'email');
    if (!template) {
      // Try all channels
      const templates = await notificationRepository.listTemplates(tenantId);
      const found = templates.find((t) => t.code === input.templateCode);
      if (!found) throw new AppError(404, 'NOT_FOUND', 'Template not found');
    }

    const tpl = template || (await notificationRepository.listTemplates(tenantId)).find((t) => t.code === input.templateCode)!;
    let body = tpl.body;
    if (input.variables) {
      for (const [key, value] of Object.entries(input.variables)) {
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
      }
    }

    return this.send(tenantId, {
      recipientIds: input.recipientIds, channel: tpl.channel,
      subject: tpl.subject || undefined, body,
      entityType: input.entityType, entityId: input.entityId,
    }, actorId);
  }

  // â”€â”€â”€ BROADCAST â”€â”€â”€
  async broadcast(tenantId: string, branchId: string, input: BroadcastInput, actorId: string) {
    let recipientIds: string[] = [];

    if (input.targetType === 'all') {
      const users = await prisma.user.findMany({ where: { tenantId, status: 'active', deletedAt: null }, select: { id: true } });
      recipientIds = users.map((u) => u.id);
    } else if (input.targetType === 'role' && input.targetValue) {
      const users = await prisma.user.findMany({
        where: { tenantId, status: 'active', deletedAt: null, userRoles: { some: { role: { code: input.targetValue } } } },
        select: { id: true },
      });
      recipientIds = users.map((u) => u.id);
    }

    if (recipientIds.length === 0) throw new AppError(400, 'BAD_REQUEST', 'No recipients found for the target criteria');

    if (input.scheduledAt) {
      // Queue for scheduled delivery
      const delay = new Date(input.scheduledAt).getTime() - Date.now();
      for (const recipientId of recipientIds) {
        await notificationQueue.add('send', {
          tenantId, recipientId, channel: input.channel, subject: input.subject, body: input.body,
        }, { delay: Math.max(0, delay) });
      }
      logger.info({ tenantId, channel: input.channel, count: recipientIds.length, scheduledAt: input.scheduledAt }, 'Broadcast scheduled');
      return { scheduled: recipientIds.length, channel: input.channel, scheduledAt: input.scheduledAt };
    }

    return this.send(tenantId, { recipientIds, channel: input.channel, subject: input.subject, body: input.body }, actorId);
  }

  // â”€â”€â”€ SCHEDULE â”€â”€â”€
  async schedule(tenantId: string, input: ScheduleNotificationInput, actorId: string) {
    const delay = new Date(input.scheduledAt).getTime() - Date.now();
    if (delay < 0) throw new AppError(400, 'BAD_REQUEST', 'Scheduled time must be in the future');

    for (const recipientId of input.recipientIds) {
      await notificationQueue.add('send', {
        tenantId, recipientId, channel: input.channel, subject: input.subject, body: input.body,
      }, { delay });
    }

    logger.info({ tenantId, count: input.recipientIds.length, scheduledAt: input.scheduledAt, actorId }, 'Notification scheduled');
    return { scheduled: input.recipientIds.length, scheduledAt: input.scheduledAt };
  }

  // â”€â”€â”€ USER NOTIFICATIONS â”€â”€â”€
  async getUserNotifications(userId: string) {
    return notificationRepository.getUserNotifications(userId);
  }

  async getUnreadCount(userId: string) {
    return notificationRepository.getUnreadCount(userId);
  }

  async markAsRead(userId: string, notificationId: string) {
    const n = await notificationRepository.findById(notificationId);
    if (!n || n.recipientId !== userId) throw new AppError(404, 'NOT_FOUND', 'Notification not found');
    await notificationRepository.markAsRead(notificationId);
    return { message: 'Marked as read' };
  }

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
    return { message: 'All notifications marked as read' };
  }

  // â”€â”€â”€ ADMIN: LIST ALL â”€â”€â”€
  async listAll(tenantId: string, query: NotificationListQuery) {
    const { data, total } = await notificationRepository.list(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  // â”€â”€â”€ TEMPLATES â”€â”€â”€
  async listTemplates(tenantId: string, channel?: string) {
    return notificationRepository.listTemplates(tenantId, channel);
  }

  async createTemplate(tenantId: string, input: CreateTemplateInput, actorId: string) {
    const existing = await notificationRepository.findTemplateByCode(tenantId, input.code, input.channel);
    if (existing) throw new AppError(409, 'CONFLICT', 'Template with this code and channel already exists');

    const template = await notificationRepository.createTemplate({
      tenantId, name: input.name, code: input.code, channel: input.channel as any,
      subject: input.subject, body: input.body, variables: input.variables,
    });
    logger.info({ tenantId, code: input.code, actorId }, 'Notification template created');
    return template;
  }

  async updateTemplate(tenantId: string, id: string, input: UpdateTemplateInput, actorId: string) {
    const template = await notificationRepository.updateTemplate(id, input);
    logger.info({ tenantId, id, actorId }, 'Template updated');
    return template;
  }

  async deleteTemplate(tenantId: string, id: string, actorId: string) {
    await notificationRepository.deleteTemplate(id);
    return { message: 'Template deleted' };
  }

  // â”€â”€â”€ DELIVERY STATS â”€â”€â”€
  async getDeliveryStats(tenantId: string, startDate: string, endDate: string) {
    return notificationRepository.getDeliveryStats(tenantId, new Date(startDate), new Date(endDate));
  }
}

export const notificationService = new NotificationService();
