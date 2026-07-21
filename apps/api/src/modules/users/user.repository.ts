import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        userRoles: { include: { role: { select: { id: true, name: true, code: true } } } },
      },
    });
  }

  async findByEmail(tenantId: string, email: string) {
    return prisma.user.findUnique({ where: { tenantId_email: { tenantId, email } } });
  }

  async findByUsername(tenantId: string, username: string) {
    return prisma.user.findUnique({ where: { tenantId_username: { tenantId, username } } });
  }

  async list(tenantId: string, params: {
    page?: number; limit?: number; search?: string;
    status?: string; roleCode?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.UserWhereInput = { tenantId, deletedAt: null };

    if (params.status) where.status = params.status as any;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { username: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    if (params.roleCode) {
      where.userRoles = { some: { role: { code: params.roleCode } } };
    }

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true,
          username: true, phone: true, status: true, avatarUrl: true,
          emailVerified: true, lastLoginAt: true, createdAt: true,
          userRoles: { include: { role: { select: { id: true, name: true, code: true } } } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: any /* Prisma.UserUncheckedCreateInput */) {
    return prisma.user.create({
      data,
      include: { userRoles: { include: { role: { select: { name: true, code: true } } } } },
    });
  }

  async update(id: string, data: any /* Prisma.UserUpdateInput */) {
    return prisma.user.update({
      where: { id }, data,
      include: { userRoles: { include: { role: { select: { name: true, code: true } } } } },
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'archived', updatedBy: deletedBy },
    });
  }

  async restore(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: null, status: 'active' },
    });
  }

  // â”€â”€â”€ Roles â”€â”€â”€
  async assignRole(userId: string, roleId: string, tenantId: string, assignedBy: string, institutionId?: string, branchId?: string) {
    return prisma.userRole.upsert({
      where: { userId_roleId_tenantId: { userId, roleId, tenantId } },
      update: {},
      create: { userId, roleId, tenantId, assignedBy, institutionId, branchId },
    });
  }

  async removeRole(userId: string, roleId: string, tenantId: string) {
    return prisma.userRole.deleteMany({ where: { userId, roleId, tenantId } });
  }

  async findRoleByCode(tenantId: string, code: string) {
    return prisma.role.findUnique({ where: { tenantId_code: { tenantId, code } } });
  }

  async getUserRoles(userId: string) {
    return prisma.userRole.findMany({
      where: { userId },
      include: { role: { select: { id: true, name: true, code: true } } },
    });
  }

  // â”€â”€â”€ Sessions â”€â”€â”€
  async getActiveSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: { id: true, deviceInfo: true, ipAddress: true, userAgent: true, createdAt: true, expiresAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revokeAllSessions(userId: string, reason: string) {
    return prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date(), revokeReason: reason },
    });
  }

  async revokeSession(sessionId: string, reason: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, revokedAt: new Date(), revokeReason: reason },
    });
  }

  // â”€â”€â”€ Audit / Activity â”€â”€â”€
  async getAuditHistory(userId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { OR: [{ actorUserId: userId }, { entityId: userId, entityType: 'user' }] },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLoginHistory(userId: string, limit = 20) {
    return prisma.auditLog.findMany({
      where: { actorUserId: userId, action: { in: ['login', 'logout'] } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, action: true, ipAddress: true, userAgent: true, createdAt: true },
    });
  }

  // â”€â”€â”€ Bulk â”€â”€â”€
  async createMany(data: Prisma.UserCreateManyInput[]) {
    return prisma.user.createMany({ data, skipDuplicates: true });
  }

  async exportUsers(tenantId: string, filters?: { status?: string; roleCode?: string }) {
    const where: Prisma.UserWhereInput = { tenantId, deletedAt: null };
    if (filters?.status) where.status = filters.status as any;
    if (filters?.roleCode) {
      where.userRoles = { some: { role: { code: filters.roleCode } } };
    }

    return prisma.user.findMany({
      where,
      select: {
        firstName: true, lastName: true, email: true, phone: true,
        username: true, status: true, createdAt: true, lastLoginAt: true,
        userRoles: { include: { role: { select: { name: true, code: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const userRepository = new UserRepository();
