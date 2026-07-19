import { prisma, EntityStatus } from '@erp/database';
import type { Prisma } from '@erp/database';

export class SuperAdminRepository {
  // â”€â”€â”€ Dashboard Stats â”€â”€â”€
  async getDashboardStats() {
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      expiredTenants,
      totalUsers,
      totalStudents,
      totalTeachers,
    ] = await Promise.all([
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'active', deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'trial', deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'suspended', deletedAt: null } }),
      prisma.tenant.count({ where: { status: 'expired', deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.student.count({ where: { deletedAt: null } }),
      prisma.teacher.count({ where: { deletedAt: null } }),
    ]);

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      expiredTenants,
      totalUsers,
      totalStudents,
      totalTeachers,
    };
  }

  async getRecentActivity(limit = 20) {
    return prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  async getTenantGrowth(months = 6) {
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return prisma.tenant.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  // â”€â”€â”€ Tenants â”€â”€â”€
  async listTenants(params: {
    page?: number; limit?: number; search?: string;
    status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.TenantWhereInput = { deletedAt: null };
    if (params.status) where.status = params.status as any;
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { slug: { contains: params.search, mode: 'insensitive' } },
        { domain: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: { settings: true, _count: { select: { users: true, institutions: true } } },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);

    return { data, total };
  }

  async getTenantById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        institutions: { where: { deletedAt: null } },
        _count: { select: { users: true, institutions: true } },
      },
    });
  }

  async createTenant(data: {
    name: string; slug: string; domain?: string;
    status?: any; planCode?: string; trialEndsAt?: Date;
  }) {
    return prisma.tenant.create({
      data: {
        ...data,
        settings: {
          create: {
            brandingName: data.name,
            primaryColor: '#2563eb',
            secondaryColor: '#64748b',
            accentColor: '#7c3aed',
          },
        },
      },
      include: { settings: true },
    });
  }

  async updateTenant(id: string, data: any /* Prisma.TenantUpdateInput */) {
    return prisma.tenant.update({ where: { id }, data, include: { settings: true } });
  }

  async softDeleteTenant(id: string) {
    return prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async updateTenantBranding(tenantId: string, data: any /* Prisma.TenantSettingsUpdateInput */) {
    return prisma.tenantSettings.update({ where: { tenantId }, data });
  }

  async checkSlugAvailable(slug: string, excludeId?: string) {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) return true;
    return excludeId ? existing.id === excludeId : false;
  }

  // â”€â”€â”€ Users â”€â”€â”€
  async listPlatformUsers(params: {
    page?: number; limit?: number; search?: string;
    status?: string; tenantId?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.UserWhereInput = { deletedAt: null };
    if (params.status) where.status = params.status as any;
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, tenantId: true, firstName: true, lastName: true,
          email: true, phone: true, status: true, lastLoginAt: true,
          createdAt: true, tenant: { select: { name: true, slug: true } },
          userRoles: { include: { role: { select: { name: true, code: true } } } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async updateUserStatus(userId: string, status: EntityStatus) {
    return prisma.user.update({ where: { id: userId }, data: { status } });
  }

  async forceLogoutUser(userId: string) {
    return prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date(), revokeReason: 'admin_force_logout' },
    });
  }

  // â”€â”€â”€ Audit Logs â”€â”€â”€
  async listAuditLogs(params: {
    page?: number; limit?: number; tenantId?: string;
    action?: string; entityType?: string;
    startDate?: Date; endDate?: Date;
  }) {
    const where: Prisma.AuditLogWhereInput = {};
    if (params.tenantId) where.tenantId = params.tenantId;
    if (params.action) where.action = params.action;
    if (params.entityType) where.entityType = params.entityType;
    if (params.startDate || params.endDate) {
      where.createdAt = {};
      if (params.startDate) where.createdAt.gte = params.startDate;
      if (params.endDate) where.createdAt.lte = params.endDate;
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { actor: { select: { firstName: true, lastName: true, email: true } } },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return { data, total };
  }

  // â”€â”€â”€ Feature Flags â”€â”€â”€
  async getTenantFeatures(tenantId: string) {
    return prisma.featureFlag.findMany({ where: { tenantId } });
  }

  async upsertFeatureFlag(tenantId: string, feature: string, enabled: boolean) {
    return prisma.featureFlag.upsert({
      where: { tenantId_feature: { tenantId, feature } },
      update: { enabled },
      create: { tenantId, feature, enabled },
    });
  }
}

export const superAdminRepository = new SuperAdminRepository();
