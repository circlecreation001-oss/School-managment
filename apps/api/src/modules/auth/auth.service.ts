import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env, logger, redis } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
import { authRepository } from './auth.repository.js';
import { AUTH_CONSTANTS, AUTH_ERRORS } from './auth.constants.js';

/** Execute a Redis command with a timeout — returns null if Redis is unavailable */
async function redisWithTimeout<T>(fn: () => Promise<T>, timeoutMs = 2000): Promise<T | null> {
  return new Promise<T | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    fn().then((result) => { clearTimeout(timer); resolve(result); }).catch(() => { clearTimeout(timer); resolve(null); });
  });
}

import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
  RefreshTokenInput,
  SignupInstituteInput,
} from './auth.schema.js';

interface TokenPayload {
  sub: string;
  tenantId: string;
  institutionId?: string;
  branchId?: string;
  roles: string[];
  permissions: string[];
  sessionId: string;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    tenantId: string;
  };
}

export class AuthService {
  // ─── LOGIN ───
  async login(input: LoginInput, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    const { prisma } = await import('@erp/database');

    // Resolve tenant - if no tenantSlug given, auto-detect from identifier
    let tenant: any = null;
    if (input.tenantSlug) {
      tenant = await authRepository.findTenantBySlug(input.tenantSlug);
      if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', AUTH_ERRORS.TENANT_NOT_FOUND);
    } else {
      // Try platform first, then auto-detect by email/username/phone
      tenant = await authRepository.findTenantBySlug('platform');
      const identifier = input.identifier.toLowerCase().trim();

      // Check if user exists in platform tenant
      if (tenant) {
        const userInPlatform = await authRepository.findUserByIdentifier(tenant.id, input.identifier);
        if (!userInPlatform) {
          // Not in platform - search globally by email/username/phone
          const globalUser = await prisma.user.findFirst({
            where: {
              deletedAt: null,
              OR: [
                { email: identifier },
                { username: identifier },
                { phone: input.identifier.trim() },
              ],
            },
            select: { tenantId: true },
          });
          if (globalUser) {
            tenant = await authRepository.findTenantById(globalUser.tenantId);
          }
        }
      }

      if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', AUTH_ERRORS.TENANT_NOT_FOUND);
    }

    // Check tenant status
    if (tenant.status === 'suspended') {
      throw new AppError(403, 'TENANT_SUSPENDED', 'This institution account has been suspended. Contact support.');
    }
    if (tenant.status === 'expired' || tenant.status === 'cancelled') {
      throw new AppError(403, 'TENANT_EXPIRED', 'This institution subscription has expired. Please renew.');
    }
    if (tenant.status === 'archived') {
      throw new AppError(403, 'TENANT_ARCHIVED', 'This institution account no longer exists.');
    }

    // Check account lockout (keyed on identifier) - graceful if Redis unavailable
    const lockKey = `auth:lock:${tenant.id}:${input.identifier}`;
    try {
      const isLocked = await redis.get(lockKey);
      if (isLocked) throw new AppError(423, 'ACCOUNT_LOCKED', AUTH_ERRORS.ACCOUNT_LOCKED);
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      // Redis unavailable — skip lockout check
    }

    // Find user by any supported identifier
    const user = await authRepository.findUserByIdentifier(tenant.id, input.identifier);
    if (!user) {
      await this.incrementFailedAttempts(tenant.id, input.identifier);
      throw new AppError(401, 'INVALID_CREDENTIALS', AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Check user status
    if (user.status === 'inactive') throw new AppError(403, 'ACCOUNT_INACTIVE', AUTH_ERRORS.ACCOUNT_INACTIVE);
    if (user.status === 'suspended') throw new AppError(403, 'ACCOUNT_SUSPENDED', AUTH_ERRORS.ACCOUNT_SUSPENDED);

    // Block login for unverified accounts (except platform super admin)
    if (!user.emailVerified && tenant.slug !== 'platform') {
      throw new AppError(403, 'EMAIL_NOT_VERIFIED', 'Please verify your email address before logging in. Check your inbox for the verification OTP.');
    }

    // Verify password
    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      await this.incrementFailedAttempts(tenant.id, input.identifier);
      throw new AppError(401, 'INVALID_CREDENTIALS', AUTH_ERRORS.INVALID_CREDENTIALS);
    }

    // Clear failed attempts on success (graceful if Redis unavailable)
    try { await redis.del(`auth:attempts:${tenant.id}:${input.identifier}`); } catch { /* ignore */ }

    // Get roles and permissions
    const { roles, permissions } = await authRepository.getUserRoles(user.id);

    // Enforce session limit
    const activeCount = await authRepository.countActiveSessions(user.id);
    if (activeCount >= AUTH_CONSTANTS.SESSION_MAX_PER_USER) {
      const sessions = await authRepository.getActiveSessions(user.id);
      if (sessions.length > 0) {
        const oldest = sessions[sessions.length - 1];
        if (oldest) await authRepository.revokeSession(oldest.id, 'session_limit_reached');
      }
    }

    // Generate tokens
    const sessionId = crypto.randomUUID();
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + this.parseExpiry(env.jwtRefreshExpiry) * 1000);

    const payload: TokenPayload = {
      sub: user.id,
      tenantId: tenant.id,
      roles,
      permissions,
      sessionId,
    };

    const accessToken = this.generateAccessToken(payload);
    const expiresIn = this.parseExpiry(env.jwtAccessExpiry);

    // Store session
    await authRepository.createSession({
      userId: user.id,
      tenantId: tenant.id,
      refreshToken,
      deviceInfo: input.deviceInfo || null,
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      expiresAt,
    });

    // Update last login
    await authRepository.updateLastLogin(user.id, meta.ip);

    // Audit log
    await authRepository.createAuditLog({
      tenantId: tenant.id,
      actorUserId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'login',
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantId: tenant.id,
      },
    };
  }

  // ─── REGISTER ───
  async register(input: RegisterInput): Promise<{ userId: string; message: string }> {
    const tenantSlug = input.tenantSlug || 'platform';
    const tenant = await authRepository.findTenantBySlug(tenantSlug);
    if (!tenant) throw new AppError(404, 'TENANT_NOT_FOUND', AUTH_ERRORS.TENANT_NOT_FOUND);

    // Check duplicate email
    const existing = await authRepository.findUserByEmail(tenant.id, input.email);
    if (existing) throw new AppError(409, 'CONFLICT', AUTH_ERRORS.EMAIL_ALREADY_EXISTS);

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, 12);

    // Create user
    const user = await authRepository.createUser({
      tenantId: tenant.id,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      phone: input.phone,
    });

    // Store password in history
    await this.addPasswordToHistory(user.id, passwordHash);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    // Send OTP for email verification (direct SMTP, no Redis dependency for sending)
    try {
      const { otpService } = await import('./otp.service.js');
      const { sendEmailDirect } = await import('../../utils/send-email.js');

      // Generate OTP — if Redis is available it's stored there; if not, use DB-less approach
      let otp: string;
      try {
        otp = await otpService.generateOtp(input.email, 'signup');
      } catch {
        // Redis unavailable — generate OTP and store temporarily in a simple hash
        otp = String(crypto.randomInt(100000, 999999));
        // Store in Redis with timeout fallback
        await redisWithTimeout(() => redis.setex(`otp:signup:${input.email.toLowerCase().trim()}`, 300, JSON.stringify({ hash: crypto.createHash('sha256').update(otp).digest('hex'), attempts: 0, createdAt: Date.now() })));
      }

      await sendEmailDirect({
        to: input.email,
        subject: 'SchoolNex - Verify Your Email',
        text: `Your SchoolNex verification code is: ${otp}\n\nThis code expires in 5 minutes.\nDo not share this code with anyone.\n\nIf you did not request this, please ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px"><h2 style="color:#2563eb">Verify Your Email</h2><p>Hi ${input.firstName},</p><p>Your verification code is:</p><div style="margin:24px 0;text-align:center"><span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1e293b;background:#f1f5f9;padding:16px 32px;border-radius:12px;display:inline-block">${otp}</span></div><p style="color:#64748b;font-size:13px">This code expires in <strong>5 minutes</strong>.</p><p style="color:#64748b;font-size:13px">Do not share this code with anyone.</p><hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"><p style="color:#94a3b8;font-size:11px">SchoolNex - Complete School Management ERP</p></div>`,
      });
    } catch (emailErr) {
      logger.warn({ err: emailErr }, 'OTP email send failed (non-fatal - user can request resend)');
    }

    return {
      userId: user.id,
      message: 'Registration successful. Please check your email for the verification code.',
    };
  }

  // ─── REFRESH TOKEN ───
  async refreshToken(input: RefreshTokenInput, meta: { ip: string; userAgent: string }): Promise<AuthResult> {
    const session = await authRepository.findSessionByToken(input.refreshToken);

    if (!session) throw new AppError(401, 'TOKEN_INVALID', AUTH_ERRORS.TOKEN_INVALID);
    if (!session.isActive) throw new AppError(401, 'SESSION_REVOKED', AUTH_ERRORS.SESSION_REVOKED);
    if (session.expiresAt < new Date()) {
      await authRepository.revokeSession(session.id, 'expired');
      throw new AppError(401, 'TOKEN_EXPIRED', AUTH_ERRORS.TOKEN_EXPIRED);
    }

    const user = session.user;
    if (user.status !== 'active') {
      await authRepository.revokeSession(session.id, 'user_inactive');
      throw new AppError(403, 'ACCOUNT_INACTIVE', AUTH_ERRORS.ACCOUNT_INACTIVE);
    }

    // Get fresh roles/permissions
    const { roles, permissions } = await authRepository.getUserRoles(user.id);

    // Rotate refresh token
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newExpiry = new Date(Date.now() + this.parseExpiry(env.jwtRefreshExpiry) * 1000);
    await authRepository.rotateRefreshToken(session.id, newRefreshToken, newExpiry);

    // Generate new access token
    const payload: TokenPayload = {
      sub: user.id,
      tenantId: session.tenantId,
      roles,
      permissions,
      sessionId: session.id,
    };

    const accessToken = this.generateAccessToken(payload);
    const expiresIn = this.parseExpiry(env.jwtAccessExpiry);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles,
        tenantId: session.tenantId,
      },
    };
  }

  // ─── LOGOUT ───
  async logout(userId: string, refreshToken?: string, allDevices = false, meta?: { ip: string; userAgent: string }) {
    if (allDevices) {
      await authRepository.revokeAllUserSessions(userId, 'logout_all');
    } else if (refreshToken) {
      const session = await authRepository.findSessionByToken(refreshToken);
      if (session && session.userId === userId) {
        await authRepository.revokeSession(session.id, 'logout');
      }
    }

    // Audit log
    const user = await authRepository.findUserById(userId);
    if (user) {
      await authRepository.createAuditLog({
        tenantId: user.tenantId,
        actorUserId: userId,
        entityType: 'user',
        entityId: userId,
        action: 'logout',
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        metadata: { allDevices },
      });
    }
  }

  // ─── FORGOT PASSWORD ───
  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const tenantSlug = input.tenantSlug || 'platform';
    const tenant = await authRepository.findTenantBySlug(tenantSlug);
    if (!tenant) {
      // Don't reveal tenant existence
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const user = await authRepository.findUserByEmail(tenant.id, input.email);
    if (!user) {
      // Don't reveal user existence
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await redis.setex(
      `auth:reset:${hashedToken}`,
      AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MINUTES * 60,
      JSON.stringify({ userId: user.id, tenantId: tenant.id }),
    );

    // Queue password reset email
    try {
      const { emailQueue } = await import('../../config/index.js');
      const resetLink = `${env.appUrl}/reset-password?token=${resetToken}`;
      await emailQueue.add('reset-password', {
        to: input.email,
        subject: 'Reset your password',
        body: `Hi,\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in ${AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MINUTES} minutes.\n\nIf you did not request this, please ignore this email.\n\nThank you.`,
        html: `<p>Hi,</p><p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetLink}">Reset Password</a></p><p>This link will expire in ${AUTH_CONSTANTS.RESET_TOKEN_EXPIRY_MINUTES} minutes.</p><p>If you did not request this, please ignore this email.</p>`,
        tenantId: tenant.id,
        channel: 'email',
      });
    } catch (emailErr) {
      logger.warn({ err: emailErr }, 'Reset email queueing failed (non-fatal)');
    }

    // Audit log
    await authRepository.createAuditLog({
      tenantId: tenant.id,
      actorUserId: user.id,
      entityType: 'user',
      entityId: user.id,
      action: 'forgot_password',
    });

    return { message: 'If the email exists, a reset link has been sent.' };
  }

  // ─── RESET PASSWORD ───
  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const hashedToken = crypto.createHash('sha256').update(input.token).digest('hex');
    const stored = await redis.get(`auth:reset:${hashedToken}`);

    if (!stored) throw new AppError(400, 'RESET_TOKEN_INVALID', AUTH_ERRORS.RESET_TOKEN_INVALID);

    const { userId, tenantId } = JSON.parse(stored) as { userId: string; tenantId: string };

    // Check password history
    const isInHistory = await this.isPasswordInHistory(userId, input.password);
    if (isInHistory) throw new AppError(400, 'PASSWORD_IN_HISTORY', AUTH_ERRORS.PASSWORD_IN_HISTORY);

    // Hash and update
    const passwordHash = await bcrypt.hash(input.password, 12);
    await authRepository.updatePassword(userId, passwordHash);
    await this.addPasswordToHistory(userId, passwordHash);

    // Invalidate token
    await redis.del(`auth:reset:${hashedToken}`);

    // Revoke all sessions (force re-login)
    await authRepository.revokeAllUserSessions(userId, 'password_reset');

    // Audit log
    await authRepository.createAuditLog({
      tenantId,
      actorUserId: userId,
      entityType: 'user',
      entityId: userId,
      action: 'password_reset',
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  // ─── CHANGE PASSWORD ───
  async changePassword(userId: string, input: ChangePasswordInput, meta?: { ip: string; userAgent: string }) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', AUTH_ERRORS.USER_NOT_FOUND);

    // Verify current password
    const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
    if (!isValid) throw new AppError(400, 'CURRENT_PASSWORD_WRONG', AUTH_ERRORS.CURRENT_PASSWORD_WRONG);

    // Check not same as current
    const isSame = await bcrypt.compare(input.newPassword, user.passwordHash);
    if (isSame) throw new AppError(400, 'PASSWORD_SAME_AS_OLD', AUTH_ERRORS.PASSWORD_SAME_AS_OLD);

    // Check password history
    const isInHistory = await this.isPasswordInHistory(userId, input.newPassword);
    if (isInHistory) throw new AppError(400, 'PASSWORD_IN_HISTORY', AUTH_ERRORS.PASSWORD_IN_HISTORY);

    // Hash and update
    const passwordHash = await bcrypt.hash(input.newPassword, 12);
    await authRepository.updatePassword(userId, passwordHash);
    await this.addPasswordToHistory(userId, passwordHash);

    // Revoke all sessions except current (force other devices to re-login)
    await authRepository.revokeAllUserSessions(userId, 'password_changed');

    // Audit log
    await authRepository.createAuditLog({
      tenantId: user.tenantId,
      actorUserId: userId,
      entityType: 'user',
      entityId: userId,
      action: 'password_changed',
      ipAddress: meta?.ip,
      userAgent: meta?.userAgent,
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  // ─── VERIFY EMAIL ───
  async verifyEmail(token: string): Promise<{ message: string }> {
    const stored = await redis.get(`auth:verify:${token}`);
    if (!stored) throw new AppError(400, 'VERIFICATION_TOKEN_INVALID', AUTH_ERRORS.VERIFICATION_TOKEN_INVALID);

    const { userId, tenantId } = JSON.parse(stored) as { userId: string; tenantId: string };

    await authRepository.updateEmailVerified(userId);
    await redis.del(`auth:verify:${token}`);

    await authRepository.createAuditLog({
      tenantId,
      actorUserId: userId,
      entityType: 'user',
      entityId: userId,
      action: 'email_verified',
    });

    return { message: 'Email verified successfully.' };
  }

  // ─── GET SESSIONS ───
  async getSessions(userId: string) {
    return authRepository.getActiveSessions(userId);
  }

  // ─── REVOKE SESSION ───
  async revokeSession(userId: string, sessionId: string) {
    const sessions = await authRepository.getActiveSessions(userId);
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) throw new AppError(404, 'NOT_FOUND', 'Session not found');

    await authRepository.revokeSession(sessionId, 'user_revoked');
    return { message: 'Session revoked successfully.' };
  }

  // ─── GET CURRENT USER ───
  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', AUTH_ERRORS.USER_NOT_FOUND);

    const { roles, permissions } = await authRepository.getUserRoles(userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      emailVerified: user.emailVerified,
      tenantId: user.tenantId,
      roles,
      permissions,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  }

  // ─── SIGNUP INSTITUTE ───
  async signupInstitute(input: SignupInstituteInput, meta: { ip: string; userAgent: string }): Promise<{ userId: string; email: string; message: string }> {
    const { prisma } = await import('@erp/database');

    // Generate slug from institute name
    const baseSlug = input.instituteName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check slug availability
    let slug = baseSlug;
    let attempt = 0;
    while (true) {
      const existing = await prisma.tenant.findUnique({ where: { slug } });
      if (!existing) break;
      attempt++;
      slug = `${baseSlug}-${attempt}`;
      if (attempt > 10) {
        slug = `${baseSlug}-${Date.now().toString(36)}`;
        break;
      }
    }

    // Check if email already exists globally (prevent duplicate institute owners)
    const existingUser = await prisma.user.findFirst({ where: { email: input.email.toLowerCase().trim() } });
    if (existingUser) {
      throw new AppError(409, 'CONFLICT', 'An account with this email already exists. Please log in instead.');
    }

    // Split owner name
    const nameParts = input.ownerName.trim().split(/\s+/);
    const firstName = nameParts[0] || input.ownerName;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    const trialDays = 7;
    const trialEndsAt = new Date(Date.now() + trialDays * 86400000);

    // ─── Transaction: Create tenant + institution + branch + session + subscription + admin user + roles ───
    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: input.instituteName,
          slug,
          status: 'trial',
          subscriptionStatus: 'trial',
          planCode: 'starter',
          trialEndsAt,
          settings: { create: { brandingName: input.instituteName, primaryColor: '#2563eb', secondaryColor: '#64748b', accentColor: '#7c3aed' } },
        },
      });

      // 2. Create default roles and permissions for the tenant
      const MODULES = ['users','students','teachers','parents','attendance','fees','exams','homework','study_materials','library','notifications','reports','settings','website','admissions'];
      const ACTIONS = ['view','create','edit','delete','approve','export','configure','manage'];

      // Create all permissions in a single batch
      const allPermCodes: string[] = [];
      const permissionsData: Array<{ tenantId: string; code: string; name: string; module: string; action: string }> = [];
      for (const mod of MODULES) {
        for (const act of ACTIONS) {
          const code = `${mod}:${act}`;
          allPermCodes.push(code);
          permissionsData.push({ tenantId: tenant.id, code, name: `${act} ${mod}`, module: mod, action: act });
        }
      }
      await tx.permission.createMany({ data: permissionsData });

      // Create roles
      const defaultRoles = [
        { name: 'Tenant Admin', code: 'tenant_admin', isSystemRole: true },
        { name: 'Institution Admin', code: 'institution_admin', isSystemRole: true },
        { name: 'Principal', code: 'principal', isSystemRole: true },
        { name: 'Vice Principal', code: 'vice_principal', isSystemRole: true },
        { name: 'Head of Department', code: 'hod', isSystemRole: true },
        { name: 'Teacher', code: 'teacher', isSystemRole: true },
        { name: 'Student', code: 'student', isSystemRole: true },
        { name: 'Parent', code: 'parent', isSystemRole: true },
        { name: 'Accountant', code: 'accountant', isSystemRole: true },
        { name: 'Librarian', code: 'librarian', isSystemRole: true },
        { name: 'Receptionist', code: 'receptionist', isSystemRole: true },
        { name: 'HR Manager', code: 'hr_manager', isSystemRole: true },
        { name: 'Transport Manager', code: 'transport_manager', isSystemRole: true },
        { name: 'Hostel Warden', code: 'hostel_warden', isSystemRole: true },
        { name: 'Inventory Manager', code: 'inventory_manager', isSystemRole: true },
      ];

      await tx.role.createMany({ data: defaultRoles.map(r => ({ tenantId: tenant.id, ...r })) });

      // Assign ALL permissions to tenant_admin role
      const tenantAdminRole = await tx.role.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'tenant_admin' } } });
      if (tenantAdminRole) {
        const allPerms = await tx.permission.findMany({ where: { tenantId: tenant.id }, select: { id: true } });
        const rolePermData = allPerms.map((perm) => ({ roleId: tenantAdminRole.id, permissionId: perm.id }));
        await tx.rolePermission.createMany({ data: rolePermData });
      }

      // 3. Create institution + branch
      const institution = await tx.institution.create({
        data: { tenantId: tenant.id, name: input.instituteName, code: slug.toUpperCase().replace(/-/g, '_'), type: input.instituteType || 'school', status: 'active' },
      });

      const branch = await tx.branch.create({
        data: { tenantId: tenant.id, institutionId: institution.id, name: 'Main Campus', code: 'MAIN', status: 'active' },
      });

      // 4. Create default academic session
      const currentYear = new Date().getFullYear();
      await tx.academicSession.create({
        data: { tenantId: tenant.id, name: `${currentYear}-${currentYear + 1}`, startDate: new Date(`${currentYear}-04-01`), endDate: new Date(`${currentYear + 1}-03-31`), isCurrent: true, status: 'active' },
      });

      // 5. Create subscription
      const plan = await tx.plan.findFirst({ where: { code: 'starter', isActive: true } });
      if (plan) {
        await tx.subscription.create({
          data: { tenantId: tenant.id, planId: plan.id, status: 'active', startDate: new Date(), endDate: trialEndsAt, billingCycle: plan.billingCycle, amount: plan.price, currency: plan.currency },
        });
      }

      // 6. Create admin user
      const passwordHash = await bcrypt.hash(input.password, 12);
      const user = await tx.user.create({
        data: { tenantId: tenant.id, firstName, lastName, email: input.email.toLowerCase().trim(), phone: input.mobile, passwordHash, status: 'active', emailVerified: false, username: slug + '-admin' },
      });

      // 7. Assign tenant_admin role
      const adminRole = await tx.role.findUnique({ where: { tenantId_code: { tenantId: tenant.id, code: 'tenant_admin' } } });
      if (adminRole) {
        await tx.userRole.create({ data: { userId: user.id, roleId: adminRole.id, tenantId: tenant.id } });
      }

      // 8. Create default org configs
      const configs = [
        { module: 'general', key: 'onboarding_complete', value: 'false' },
        { module: 'general', key: 'institution_id', value: institution.id },
        { module: 'general', key: 'branch_id', value: branch.id },
        { module: 'general', key: 'city', value: input.city },
        { module: 'general', key: 'state', value: input.state },
        { module: 'general', key: 'country', value: input.country || 'India' },
        { module: 'attendance', key: 'working_days', value: 'Mon,Tue,Wed,Thu,Fri,Sat' },
        { module: 'fees', key: 'late_fee_per_day', value: '0' },
        { module: 'fees', key: 'receipt_prefix', value: 'RCT' },
        { module: 'examination', key: 'grading_system', value: 'percentage' },
        { module: 'notifications', key: 'email_enabled', value: 'true' },
        { module: 'notifications', key: 'sms_enabled', value: 'false' },
        { module: 'notifications', key: 'whatsapp_enabled', value: 'false' },
        { module: 'website', key: 'cms_enabled', value: 'true' },
        { module: 'storage', key: 'bucket', value: 'schoolnex' },
      ];
      await tx.organizationConfig.createMany({ data: configs.map(cfg => ({ tenantId: tenant.id, ...cfg })) });

      return { tenant, user, adminRole };
    }, { timeout: 30000 });

    // ─── Send OTP for email verification (no auto-login) ───
    try {
      const { otpService } = await import('./otp.service.js');
      const otp = await otpService.generateOtp(input.email, 'signup');
      await otpService.sendOtpEmail(input.email, otp, 'signup');
    } catch (otpErr) {
      logger.warn({ err: otpErr }, 'OTP send failed during institute signup (non-fatal)');
    }

    // Audit log
    await authRepository.createAuditLog({
      tenantId: result.tenant.id,
      actorUserId: result.user.id,
      entityType: 'tenant',
      entityId: result.tenant.id,
      action: 'institute_signup',
      ipAddress: meta.ip,
      userAgent: meta.userAgent,
      metadata: { instituteName: input.instituteName, slug, trial: true },
    });

    logger.info({ tenantId: result.tenant.id, userId: result.user.id, slug }, 'Institute signup completed - OTP sent');

    return {
      userId: result.user.id,
      email: result.user.email,
      message: 'Institute registered successfully. Please verify your email with the OTP sent to your inbox.',
    };
  }

  // ─── PRIVATE HELPERS ───

  private generateAccessToken(payload: TokenPayload): string {
    const token = jwt.sign(
      { ...payload } as jwt.JwtPayload,
      env.jwtAccessSecret,
      { expiresIn: env.jwtAccessExpiry } as jwt.SignOptions,
    );
    return token;
  }

  private parseExpiry(expiry: string): number {
    const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return 900;
    const value = parseInt(match[1]!, 10);
    const unit = match[2]!;
    return value * (units[unit] || 1);
  }

  private async incrementFailedAttempts(tenantId: string, identifier: string): Promise<void> {
    try {
      const attemptsKey = `auth:attempts:${tenantId}:${identifier}`;
      const lockKey = `auth:lock:${tenantId}:${identifier}`;

      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, AUTH_CONSTANTS.LOCKOUT_DURATION_MINUTES * 60);

      if (attempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
        await redis.setex(lockKey, AUTH_CONSTANTS.LOCKOUT_DURATION_MINUTES * 60, '1');
        await redis.del(attemptsKey);
        logger.warn({ tenantId, identifier }, 'Account locked due to too many failed attempts');
      }
    } catch {
      // Redis unavailable — skip lockout tracking
    }
  }

  private async addPasswordToHistory(userId: string, passwordHash: string): Promise<void> {
    await redisWithTimeout(async () => {
      const key = `auth:pwd_history:${userId}`;
      await redis.lpush(key, passwordHash);
      await redis.ltrim(key, 0, AUTH_CONSTANTS.PASSWORD_HISTORY_COUNT - 1);
    });
  }

  private async isPasswordInHistory(userId: string, newPassword: string): Promise<boolean> {
    try {
      const key = `auth:pwd_history:${userId}`;
      const history = await redis.lrange(key, 0, -1);

      for (const hash of history) {
        const matches = await bcrypt.compare(newPassword, hash);
        if (matches) return true;
      }
      return false;
    } catch {
      // Redis unavailable — skip password history check
      return false;
    }
  }
}

export const authService = new AuthService();
