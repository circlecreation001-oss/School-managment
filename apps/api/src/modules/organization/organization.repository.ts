import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class OrganizationRepository {
  // â”€â”€â”€ Tenants â”€â”€â”€
  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
        institutions: { where: { deletedAt: null }, select: { id: true, name: true, code: true, status: true } },
        featureFlags: true,
        _count: { select: { users: true, institutions: true } },
      },
    });
  }

  async findBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug }, include: { settings: true } });
  }

  async list(params: {
    page?: number; limit?: number; search?: string;
    status?: string; type?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
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
        include: {
          settings: { select: { brandingName: true, logoUrl: true, timezone: true, currency: true } },
          _count: { select: { users: true, institutions: true } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy || 'createdAt']: params.sortOrder || 'desc' },
      }),
      prisma.tenant.count({ where }),
    ]);
    return { data, total };
  }

  async create(data: Prisma.TenantCreateInput) {
    return prisma.tenant.create({ data, include: { settings: true } });
  }

  async update(id: string, data: any /* Prisma.TenantUpdateInput */) {
    return prisma.tenant.update({ where: { id }, data, include: { settings: true } });
  }

  async softDelete(id: string) {
    return prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived' },
    });
  }

  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (!existing) return true;
    return excludeId ? existing.id === excludeId : false;
  }

  async isDomainAvailable(domain: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.tenant.findUnique({ where: { domain } });
    if (!existing) return true;
    return excludeId ? existing.id === excludeId : false;
  }

  // â”€â”€â”€ Branding / Settings â”€â”€â”€
  async updateSettings(tenantId: string, data: any /* Prisma.TenantSettingsUpdateInput */) {
    return prisma.tenantSettings.update({ where: { tenantId }, data });
  }

  async getSettings(tenantId: string) {
    return prisma.tenantSettings.findUnique({ where: { tenantId } });
  }

  // â”€â”€â”€ Plans â”€â”€â”€
  async listPlans(activeOnly = true) {
    const where: Prisma.PlanWhereInput = {};
    if (activeOnly) where.isActive = true;
    return prisma.plan.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async findPlanByCode(code: string) {
    return prisma.plan.findUnique({ where: { code } });
  }

  async createPlan(data: Prisma.PlanCreateInput) {
    return prisma.plan.create({ data });
  }

  async updatePlan(id: string, data: any /* Prisma.PlanUpdateInput */) {
    return prisma.plan.update({ where: { id }, data });
  }

  // â”€â”€â”€ Subscriptions â”€â”€â”€
  async getActiveSubscription(tenantId: string) {
    return prisma.subscription.findFirst({
      where: { tenantId, status: 'active' },
      include: { plan: true },
      orderBy: { startDate: 'desc' },
    });
  }

  async listSubscriptions(tenantId: string) {
    return prisma.subscription.findMany({
      where: { tenantId },
      include: { plan: { select: { name: true, code: true } } },
      orderBy: { startDate: 'desc' },
    });
  }

  async createSubscription(data: any /* Prisma.SubscriptionUncheckedCreateInput */) {
    return prisma.subscription.create({ data, include: { plan: true } });
  }

  async updateSubscription(id: string, data: any /* Prisma.SubscriptionUpdateInput */) {
    return prisma.subscription.update({ where: { id }, data });
  }

  async expireSubscription(id: string) {
    return prisma.subscription.update({
      where: { id },
      data: { status: 'expired' },
    });
  }

  // â”€â”€â”€ Organization Config â”€â”€â”€
  async getConfigs(tenantId: string, module?: string) {
    const where: Prisma.OrganizationConfigWhereInput = { tenantId };
    if (module) where.module = module;
    return prisma.organizationConfig.findMany({ where, orderBy: { key: 'asc' } });
  }

  async upsertConfig(tenantId: string, module: string, key: string, value: string) {
    return prisma.organizationConfig.upsert({
      where: { tenantId_module_key: { tenantId, module, key } },
      update: { value },
      create: { tenantId, module, key, value },
    });
  }

  async deleteConfig(tenantId: string, module: string, key: string) {
    return prisma.organizationConfig.deleteMany({ where: { tenantId, module, key } });
  }

  // â”€â”€â”€ Feature Flags â”€â”€â”€
  async getFeatures(tenantId: string) {
    return prisma.featureFlag.findMany({ where: { tenantId } });
  }

  async upsertFeature(tenantId: string, feature: string, enabled: boolean) {
    return prisma.featureFlag.upsert({
      where: { tenantId_feature: { tenantId, feature } },
      update: { enabled },
      create: { tenantId, feature, enabled },
    });
  }

  // â”€â”€â”€ Organization Admin Users â”€â”€â”€
  async getOrgAdmins(tenantId: string) {
    return prisma.user.findMany({
      where: {
        tenantId,
        deletedAt: null,
        userRoles: { some: { role: { code: { in: ['tenant_admin', 'institution_admin'] } } } },
      },
      select: {
        id: true, firstName: true, lastName: true, email: true, phone: true,
        status: true, lastLoginAt: true, createdAt: true,
        userRoles: { include: { role: { select: { name: true, code: true } } } },
      },
    });
  }

  // â”€â”€â”€ Usage Stats â”€â”€â”€
  async getUsageStats(tenantId: string) {
    const [users, students, teachers, institutions] = await Promise.all([
      prisma.user.count({ where: { tenantId, deletedAt: null } }),
      prisma.student.count({ where: { tenantId, deletedAt: null } }),
      prisma.teacher.count({ where: { tenantId, deletedAt: null } }),
      prisma.institution.count({ where: { tenantId, deletedAt: null } }),
    ]);
    return { users, students, teachers, institutions };
  }
}

export const organizationRepository = new OrganizationRepository();
