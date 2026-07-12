import { prisma } from '@erp/database';
import crypto from 'crypto';

export class AuthRepository {
  /**
   * Find a user by ANY identifier:
   * email, username, phone, admission number (student), or employee code (teacher).
   * Super Admin lookup is email-only (no tenantId required).
   */
  async findUserByIdentifier(tenantId: string, identifier: string) {
    const lc = identifier.toLowerCase().trim();

    // Try direct User table columns first
    const user = await prisma.user.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          { email: lc },
          { username: lc },
          { phone: identifier.trim() },
        ],
      },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });

    if (user) return user;

    // Check student admission number
    const student = await prisma.student.findFirst({
      where: { tenantId, admissionNumber: identifier.trim().toUpperCase(), deletedAt: null },
      select: { userId: true },
    });
    if (student?.userId) {
      return prisma.user.findUnique({
        where: { id: student.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      });
    }

    // Check teacher employee code
    const teacher = await prisma.teacher.findFirst({
      where: { tenantId, employeeCode: identifier.trim().toUpperCase(), deletedAt: null },
      select: { userId: true },
    });
    if (teacher?.userId) {
      return prisma.user.findUnique({
        where: { id: teacher.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      });
    }

    return null;
  }

  async findUserByEmail(tenantId: string, email: string) {
    return prisma.user.findUnique({
      where: { tenantId_email: { tenantId, email: email.toLowerCase().trim() } },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({ where: { slug } });
  }

  async findTenantById(id: string) {
    return prisma.tenant.findUnique({ where: { id } });
  }

  async createUser(data: {
    tenantId: string;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
    phone?: string;
  }) {
    return prisma.user.create({ data });
  }

  async updateLastLogin(userId: string, ip: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), lastLoginIp: ip },
    });
  }

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash, updatedAt: new Date() },
    });
  }

  async updateEmailVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  }

  // ─── Sessions ───
  async createSession(data: {
    userId: string;
    tenantId: string;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    return prisma.session.create({ data });
  }

  async findSessionByToken(refreshToken: string) {
    return prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });
  }

  async revokeSession(sessionId: string, reason: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false, revokedAt: new Date(), revokeReason: reason },
    });
  }

  async revokeAllUserSessions(userId: string, reason: string) {
    return prisma.session.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false, revokedAt: new Date(), revokeReason: reason },
    });
  }

  async countActiveSessions(userId: string) {
    return prisma.session.count({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
    });
  }

  async getActiveSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, isActive: true, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async rotateRefreshToken(sessionId: string, newToken: string, newExpiry: Date) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { refreshToken: newToken, expiresAt: newExpiry, updatedAt: new Date() },
    });
  }

  // ─── Audit ───
  async createAuditLog(data: {
    tenantId: string;
    actorUserId?: string;
    entityType: string;
    entityId?: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.auditLog.create({ data });
  }

  // ─── Password Reset Tokens (stored in Redis) ───
  // These are handled via Redis in the service layer

  // ─── Role & Permissions ───
  async getUserRoles(userId: string) {
    const userRoles = await prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    const roles = userRoles.map((ur) => ur.role.code);
    const permissions = [
      ...new Set(
        userRoles.flatMap((ur) =>
          ur.role.rolePermissions.map((rp) => rp.permission.code),
        ),
      ),
    ];

    return { roles, permissions };
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string, assignedBy?: string) {
    return prisma.userRole.upsert({
      where: { userId_roleId_tenantId: { userId, roleId, tenantId } },
      update: {},
      create: { userId, roleId, tenantId, assignedBy },
    });
  }

  async findRoleByCode(tenantId: string, code: string) {
    return prisma.role.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });
  }
}

export const authRepository = new AuthRepository();
