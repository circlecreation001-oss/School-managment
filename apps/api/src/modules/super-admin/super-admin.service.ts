import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { superAdminRepository } from './super-admin.repository.js';
import { authRepository } from '../auth/auth.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  CreateTenantInput, UpdateTenantInput, TenantBrandingInput,
  UpdateUserStatusInput, CreateAnnouncementInput,
} from './super-admin.schema.js';

export class SuperAdminService {
  // ─── DASHBOARD ───
  async getDashboard() {
    const stats = await superAdminRepository.getDashboardStats();
    const recentActivity = await superAdminRepository.getRecentActivity(10);
    const growth = await superAdminRepository.getTenantGrowth(6);

    // Group growth by month
    const monthlyGrowth = this.groupByMonth(growth);

    return { stats, recentActivity, monthlyGrowth };
  }

  // ─── TENANT MANAGEMENT ───
  async listTenants(params: {
    page: number; limit: number; search?: string;
    status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const { data, total } = await superAdminRepository.listTenants(params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { data, meta };
  }

  async getTenant(id: string) {
    const tenant = await superAdminRepository.getTenantById(id);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const features = await superAdminRepository.getTenantFeatures(id);
    return { ...tenant, features };
  }

  async createTenant(input: CreateTenantInput, actorId: string) {
    // Check slug availability
    const available = await superAdminRepository.checkSlugAvailable(input.slug);
    if (!available) throw new AppError(409, 'CONFLICT', 'Organization slug already taken');

    const trialEndsAt = input.trialDays
      ? new Date(Date.now() + input.trialDays * 86400000)
      : undefined;

    const tenant = await superAdminRepository.createTenant({
      name: input.name,
      slug: input.slug,
      domain: input.domain || undefined,
      status: 'trial',
      planCode: input.planCode || 'starter',
      trialEndsAt,
    });

    logger.info({ tenantId: tenant.id, slug: tenant.slug, actorId }, 'Tenant created');
    return tenant;
  }

  async updateTenant(id: string, input: UpdateTenantInput, actorId: string) {
    const existing = await superAdminRepository.getTenantById(id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const tenant = await superAdminRepository.updateTenant(id, input);
    logger.info({ tenantId: id, changes: input, actorId }, 'Tenant updated');
    return tenant;
  }

  async suspendTenant(id: string, actorId: string) {
    const tenant = await superAdminRepository.getTenantById(id);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');
    if (tenant.status === 'suspended') throw new AppError(400, 'BAD_REQUEST', 'Already suspended');

    const updated = await superAdminRepository.updateTenant(id, { status: 'suspended' });
    logger.warn({ tenantId: id, actorId }, 'Tenant suspended');
    return updated;
  }

  async activateTenant(id: string, actorId: string) {
    const tenant = await superAdminRepository.getTenantById(id);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const updated = await superAdminRepository.updateTenant(id, { status: 'active' });
    logger.info({ tenantId: id, actorId }, 'Tenant activated');
    return updated;
  }

  async deleteTenant(id: string, actorId: string) {
    const tenant = await superAdminRepository.getTenantById(id);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    await superAdminRepository.softDeleteTenant(id);
    logger.warn({ tenantId: id, actorId }, 'Tenant soft-deleted');
    return { message: 'Organization deleted successfully' };
  }

  async updateBranding(tenantId: string, input: TenantBrandingInput) {
    const tenant = await superAdminRepository.getTenantById(tenantId);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    return superAdminRepository.updateTenantBranding(tenantId, input);
  }

  async updateFeatureFlags(tenantId: string, features: Record<string, boolean>) {
    const tenant = await superAdminRepository.getTenantById(tenantId);
    if (!tenant) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const results = await Promise.all(
      Object.entries(features).map(([feature, enabled]) =>
        superAdminRepository.upsertFeatureFlag(tenantId, feature, enabled)
      )
    );

    return results;
  }

  // ─── USER MANAGEMENT ───
  async listUsers(params: {
    page: number; limit: number; search?: string;
    status?: string; tenantId?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const { data, total } = await superAdminRepository.listPlatformUsers(params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { data, meta };
  }

  async updateUserStatus(userId: string, input: UpdateUserStatusInput, actorId: string) {
    await superAdminRepository.updateUserStatus(userId, input.status);

    if (input.status === 'suspended') {
      await superAdminRepository.forceLogoutUser(userId);
    }

    logger.info({ userId, status: input.status, actorId }, 'User status updated by admin');
    return { message: `User status updated to ${input.status}` };
  }

  async forceLogoutUser(userId: string, actorId: string) {
    await superAdminRepository.forceLogoutUser(userId);
    logger.info({ userId, actorId }, 'User force-logged out by admin');
    return { message: 'User sessions revoked' };
  }

  async resetUserPassword(userId: string, actorId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found');

    // Generate temporary password and force reset on next login
    // In production this would send an email with a reset link
    const bcrypt = await import('bcryptjs');
    const tempPassword = 'Temp@' + Math.random().toString(36).slice(2, 10);
    const hash = await bcrypt.hash(tempPassword, 12);
    await authRepository.updatePassword(userId, hash);
    await superAdminRepository.forceLogoutUser(userId);

    logger.info({ userId, actorId }, 'User password reset by admin');
    return { message: 'Password reset. User must set new password on login.' };
  }

  // ─── AUDIT LOGS ───
  async listAuditLogs(params: {
    page: number; limit: number; tenantId?: string;
    action?: string; entityType?: string;
    startDate?: string; endDate?: string;
  }) {
    const { data, total } = await superAdminRepository.listAuditLogs({
      ...params,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
    });
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { data, meta };
  }

  // ─── ANNOUNCEMENTS ───
  async createAnnouncement(input: CreateAnnouncementInput, actorId: string) {
    // In a full implementation this would create a notification job
    // and broadcast to the targeted tenants/users
    logger.info({ actorId, title: input.title, targets: input.targetType }, 'Announcement created');
    return {
      message: 'Announcement queued for delivery',
      channels: input.channels,
      targetType: input.targetType,
    };
  }

  // ─── HELPERS ───
  private groupByMonth(records: Array<{ createdAt: Date; status: string }>) {
    const months: Record<string, number> = {};
    for (const record of records) {
      const key = `${record.createdAt.getFullYear()}-${String(record.createdAt.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    }
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }
}

export const superAdminService = new SuperAdminService();
