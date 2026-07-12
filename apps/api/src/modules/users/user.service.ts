import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AppError } from '../../utils/errors.js';
import { logger, redis } from '../../config/index.js';
import { prisma } from '@erp/database';
import { userRepository } from './user.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreateUserInput, UpdateUserInput, UpdateProfileInput, AssignRoleInput, BulkImportInput, UserListQuery } from './user.schema.js';

export class UserService {
  // ─── LIST ───
  async list(tenantId: string, query: UserListQuery) {
    const { data, total } = await userRepository.list(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  // ─── GET ───
  async getById(tenantId: string, id: string) {
    const user = await userRepository.findById(id);
    if (!user || user.tenantId !== tenantId || user.deletedAt) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }
    const { passwordHash: _, ...safe } = user as any;
    return safe;
  }

  // ─── CREATE ───
  async create(tenantId: string, input: CreateUserInput, actorId: string) {
    // Check duplicate email
    const existing = await userRepository.findByEmail(tenantId, input.email);
    if (existing) throw new AppError(409, 'CONFLICT', 'A user with this email already exists');

    if (input.username) {
      const byUsername = await userRepository.findByUsername(tenantId, input.username);
      if (byUsername) throw new AppError(409, 'CONFLICT', 'Username is already taken');
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    const user = await userRepository.create({
      tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      username: input.username,
      passwordHash,
      status: input.status,
      emailVerified: false,
      createdBy: actorId,
    });

    // Assign role
    const role = await userRepository.findRoleByCode(tenantId, input.roleCode);
    if (role) {
      await userRepository.assignRole(user.id, role.id, tenantId, actorId, input.institutionId, input.branchId);
    }

    // Generate verification token
    const token = crypto.randomBytes(32).toString('hex');
    await redis.setex(`auth:verify:${token}`, 86400, JSON.stringify({ userId: user.id, tenantId }));

    await this.audit(tenantId, actorId, 'user', user.id, 'create');
    logger.info({ tenantId, userId: user.id, actorId }, 'User created');

    return user;
  }

  // ─── UPDATE ───
  async update(tenantId: string, id: string, input: UpdateUserInput, actorId: string) {
    const user = await this.getById(tenantId, id);

    const data: Record<string, unknown> = { updatedBy: actorId };
    if (input.firstName) data.firstName = input.firstName;
    if (input.lastName) data.lastName = input.lastName;
    if (input.phone !== undefined) data.phone = input.phone || null;
    if (input.username) {
      if (input.username !== (user as any).username) {
        const byUsername = await userRepository.findByUsername(tenantId, input.username);
        if (byUsername && byUsername.id !== id) throw new AppError(409, 'CONFLICT', 'Username is already taken');
      }
      data.username = input.username;
    }
    if (input.status) data.status = input.status;

    const updated = await userRepository.update(id, data);
    await this.audit(tenantId, actorId, 'user', id, 'update');
    return updated;
  }

  // ─── UPDATE PROFILE (self) ───
  async updateProfile(tenantId: string, userId: string, input: UpdateProfileInput) {
    const data: Record<string, unknown> = {};
    if (input.firstName) data.firstName = input.firstName;
    if (input.lastName) data.lastName = input.lastName;
    if (input.phone !== undefined) data.phone = input.phone || null;
    if (input.avatarUrl !== undefined) data.avatarUrl = input.avatarUrl || null;

    const updated = await userRepository.update(userId, data);
    await this.audit(tenantId, userId, 'user', userId, 'profile_update');
    return updated;
  }

  // ─── STATUS CHANGES ───
  async activate(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    const user = await userRepository.update(id, { status: 'active', updatedBy: actorId });
    await this.audit(tenantId, actorId, 'user', id, 'activate');
    return user;
  }

  async suspend(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    const user = await userRepository.update(id, { status: 'suspended', updatedBy: actorId });
    await userRepository.revokeAllSessions(id, 'admin_suspended');
    await this.audit(tenantId, actorId, 'user', id, 'suspend');
    return user;
  }

  async archive(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await userRepository.softDelete(id, actorId);
    await userRepository.revokeAllSessions(id, 'admin_archived');
    await this.audit(tenantId, actorId, 'user', id, 'archive');
    return { message: 'User archived successfully' };
  }

  async restore(tenantId: string, id: string, actorId: string) {
    const user = await userRepository.findById(id);
    if (!user || user.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'User not found');
    await userRepository.restore(id);
    await this.audit(tenantId, actorId, 'user', id, 'restore');
    return { message: 'User restored successfully' };
  }

  // ─── PASSWORD ───
  async resetPassword(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    const tempPass = 'Temp@' + crypto.randomBytes(4).toString('hex');
    const hash = await bcrypt.hash(tempPass, 12);
    await userRepository.update(id, { passwordHash: hash });
    await userRepository.revokeAllSessions(id, 'password_reset_by_admin');
    await this.audit(tenantId, actorId, 'user', id, 'admin_password_reset');
    logger.info({ tenantId, userId: id, actorId }, 'User password reset by admin');
    return { message: 'Password reset. User must change on next login.' };
  }

  // ─── FORCE LOGOUT ───
  async forceLogout(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await userRepository.revokeAllSessions(id, 'admin_force_logout');
    await this.audit(tenantId, actorId, 'user', id, 'force_logout');
    return { message: 'All user sessions revoked' };
  }

  // ─── SESSIONS ───
  async getSessions(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    return userRepository.getActiveSessions(id);
  }

  async revokeSession(tenantId: string, userId: string, sessionId: string, actorId: string) {
    await this.getById(tenantId, userId);
    await userRepository.revokeSession(sessionId, 'revoked_by_admin');
    await this.audit(tenantId, actorId, 'session', sessionId, 'revoke');
    return { message: 'Session revoked' };
  }

  // ─── ROLES ───
  async assignRole(tenantId: string, userId: string, input: AssignRoleInput, actorId: string) {
    await this.getById(tenantId, userId);
    const role = await userRepository.findRoleByCode(tenantId, input.roleCode);
    if (!role) throw new AppError(404, 'NOT_FOUND', 'Role not found');

    await userRepository.assignRole(userId, role.id, tenantId, actorId, input.institutionId, input.branchId);
    await this.audit(tenantId, actorId, 'user_role', userId, 'assign_role', { roleCode: input.roleCode });
    return { message: `Role ${role.name} assigned` };
  }

  async removeRole(tenantId: string, userId: string, roleId: string, actorId: string) {
    await this.getById(tenantId, userId);
    await userRepository.removeRole(userId, roleId, tenantId);
    await this.audit(tenantId, actorId, 'user_role', userId, 'remove_role', { roleId });
    return { message: 'Role removed' };
  }

  async getRoles(tenantId: string, userId: string) {
    await this.getById(tenantId, userId);
    return userRepository.getUserRoles(userId);
  }

  // ─── ACTIVITY ───
  async getActivity(tenantId: string, userId: string) {
    await this.getById(tenantId, userId);
    return userRepository.getAuditHistory(userId);
  }

  async getLoginHistory(tenantId: string, userId: string) {
    await this.getById(tenantId, userId);
    return userRepository.getLoginHistory(userId);
  }

  // ─── BULK ───
  async bulkImport(tenantId: string, input: BulkImportInput, actorId: string) {
    let successful = 0;
    let failed = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < input.users.length; i++) {
      const row = input.users[i]!;
      try {
        const existing = await userRepository.findByEmail(tenantId, row.email);
        if (existing) { errors.push({ row: i + 1, message: 'Email already exists' }); failed++; continue; }

        const password = row.password || 'Welcome@' + crypto.randomBytes(3).toString('hex');
        const hash = await bcrypt.hash(password, 12);

        const user = await userRepository.create({
          tenantId,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          passwordHash: hash,
          status: 'active',
          emailVerified: false,
          createdBy: actorId,
        });

        const role = await userRepository.findRoleByCode(tenantId, row.roleCode);
        if (role) await userRepository.assignRole(user.id, role.id, tenantId, actorId);

        successful++;
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message || 'Unknown error' });
        failed++;
      }
    }

    await this.audit(tenantId, actorId, 'user', null, 'bulk_import', { total: input.users.length, successful, failed });
    return { total: input.users.length, successful, failed, errors };
  }

  async exportUsers(tenantId: string, filters?: { status?: string; roleCode?: string }) {
    return userRepository.exportUsers(tenantId, filters);
  }

  // ─── PRIVATE ───
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({
      data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: metadata || undefined },
    });
  }
}

export const userService = new UserService();
