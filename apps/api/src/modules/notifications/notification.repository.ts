import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class NotificationRepository {
  // ─── Notifications ───
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    return prisma.notification.create({ data });
  }

  async createMany(notifications: Prisma.NotificationCreateManyInput[]) {
    return prisma.notification.createMany({ data: notifications });
  }

  async findById(id: string) {
    return prisma.notification.findUnique({ where: { id } });
  }

  async list(tenantId: string, params: {
    page: number; limit: number; channel?: string; status?: string; recipientId?: string;
  }) {
    const where: Prisma.NotificationWhereInput = { tenantId };
    if (params.channel) where.channel = params.channel as any;
    if (params.status) where.status = params.status as any;
    if (params.recipientId) where.recipientId = params.recipientId;

    const [data, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: { recipient: { select: { firstName: true, lastName: true, email: true } } },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);
    return { data, total };
  }

  async getUserNotifications(recipientId: string, limit = 50) {
    return prisma.notification.findMany({
      where: { recipientId, channel: 'in_app' },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(recipientId: string) {
    return prisma.notification.count({ where: { recipientId, channel: 'in_app', readAt: null } });
  }

  async markAsRead(id: string) {
    return prisma.notification.update({ where: { id }, data: { readAt: new Date() } });
  }

  async markAllAsRead(recipientId: string) {
    return prisma.notification.updateMany({
      where: { recipientId, channel: 'in_app', readAt: null },
      data: { readAt: new Date() },
    });
  }

  async updateStatus(id: string, status: string, failReason?: string) {
    const data: Prisma.NotificationUpdateInput = { status: status as any };
    if (status === 'sent') data.sentAt = new Date();
    if (status === 'failed') { data.failedAt = new Date(); data.failReason = failReason; }
    return prisma.notification.update({ where: { id }, data });
  }

  async incrementRetry(id: string) {
    return prisma.notification.update({ where: { id }, data: { retryCount: { increment: 1 } } });
  }

  // ─── Templates ───
  async listTemplates(tenantId: string, channel?: string) {
    const where: Prisma.NotificationTemplateWhereInput = { tenantId };
    if (channel) where.channel = channel as any;
    return prisma.notificationTemplate.findMany({ where, orderBy: { name: 'asc' } });
  }

  async findTemplateByCode(tenantId: string, code: string, channel: string) {
    return prisma.notificationTemplate.findFirst({ where: { tenantId, code, channel: channel as any } });
  }

  async createTemplate(data: Prisma.NotificationTemplateUncheckedCreateInput) {
    return prisma.notificationTemplate.create({ data });
  }

  async updateTemplate(id: string, data: Prisma.NotificationTemplateUpdateInput) {
    return prisma.notificationTemplate.update({ where: { id }, data });
  }

  async deleteTemplate(id: string) {
    return prisma.notificationTemplate.delete({ where: { id } });
  }

  // ─── Delivery Stats ───
  async getDeliveryStats(tenantId: string, startDate: Date, endDate: Date) {
    const where: Prisma.NotificationWhereInput = { tenantId, createdAt: { gte: startDate, lte: endDate } };
    const [total, sent, delivered, failed, byChannel] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, status: 'sent' } }),
      prisma.notification.count({ where: { ...where, status: 'delivered' } }),
      prisma.notification.count({ where: { ...where, status: 'failed' } }),
      prisma.notification.groupBy({ by: ['channel', 'status'], where, _count: { id: true } }),
    ]);
    return { total, sent, delivered, failed, deliveryRate: total > 0 ? Math.round(((sent + delivered) / total) * 100) : 0, byChannel };
  }
}

export const notificationRepository = new NotificationRepository();
