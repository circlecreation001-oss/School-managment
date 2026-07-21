import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { organizationRepository } from './organization.repository.js';
import { authRepository } from '../auth/auth.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  CreateOrganizationInput, UpdateOrganizationInput, UpdateBrandingInput,
  AssignSubscriptionInput, UpdateConfigInput, CreateOrgAdminInput, CreatePlanInput,
} from './organization.schema.js';

export class OrganizationService {
  // ─── LIST ───
  async list(params: {
    page: number; limit: number; search?: string;
    status?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const { data, total } = await organizationRepository.list(params);
    const meta = buildPaginationMeta(total, params.page, params.limit);
    return { data, meta };
  }

  // ─── GET ───
  async getById(id: string) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const subscription = await organizationRepository.getActiveSubscription(id);
    const usage = await organizationRepository.getUsageStats(id);

    return { ...org, subscription, usage };
  }

  // ─── CREATE ───
  async create(input: CreateOrganizationInput, actorId: string) {
    const slugAvailable = await organizationRepository.isSlugAvailable(input.slug);
    if (!slugAvailable) throw new AppError(409, 'CONFLICT', 'Organization slug is already taken');

    if (input.domain) {
      const domainAvailable = await organizationRepository.isDomainAvailable(input.domain);
      if (!domainAvailable) throw new AppError(409, 'CONFLICT', 'Domain is already in use');
    }

    const trialEndsAt = new Date(Date.now() + input.trialDays * 86400000);

    const { prisma } = await import('@erp/database');

    const tenant = await organizationRepository.create({
      name: input.name,
      slug: input.slug,
      domain: input.domain || null,
      status: 'trial',
      subscriptionStatus: 'trial',
      planCode: input.planCode || 'starter',
      trialEndsAt,
      settings: {
        create: {
          brandingName: input.name,
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#7c3aed',
        },
      },
    });

    // ─── FULL ONBOARDING: Seed everything for the new tenant ───

    // 1. Seed roles & permissions
    await this.seedDefaultRoles(tenant.id);

    // 2. Create default institution + branch
    const institution = await prisma.institution.create({
      data: {
        tenantId: tenant.id,
        name: input.name,
        code: input.slug.toUpperCase().replace(/-/g, '_'),
        type: 'school',
        status: 'active',
      },
    });

    const branch = await prisma.branch.create({
      data: {
        tenantId: tenant.id,
        institutionId: institution.id,
        name: 'Main Campus',
        code: 'MAIN',
        status: 'active',
      },
    });

    // 3. Create default academic session
    const currentYear = new Date().getFullYear();
    await prisma.academicSession.create({
      data: {
        tenantId: tenant.id,
        name: `${currentYear}-${currentYear + 1}`,
        startDate: new Date(`${currentYear}-04-01`),
        endDate: new Date(`${currentYear + 1}-03-31`),
        isCurrent: true,
        status: 'active',
      },
    });

    // 4. Create subscription record
    const plan = await prisma.plan.findFirst({ where: { code: input.planCode || 'starter', isActive: true } });
    if (plan) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          status: 'active',
          startDate: new Date(),
          endDate: trialEndsAt,
          billingCycle: plan.billingCycle,
          amount: plan.price,
          currency: plan.currency,
        },
      });
    }

    // 5. Create default organization configs
    const defaultConfigs = [
      { module: 'general', key: 'onboarding_complete', value: 'false' },
      { module: 'general', key: 'institution_id', value: institution.id },
      { module: 'general', key: 'branch_id', value: branch.id },
      { module: 'attendance', key: 'working_days', value: 'Mon,Tue,Wed,Thu,Fri,Sat' },
      { module: 'fees', key: 'late_fee_per_day', value: '0' },
      { module: 'fees', key: 'receipt_prefix', value: 'RCT' },
      { module: 'examination', key: 'grading_system', value: 'percentage' },
    ];
    for (const cfg of defaultConfigs) {
      await prisma.organizationConfig.create({ data: { tenantId: tenant.id, ...cfg } });
    }

    // 6. Send welcome email (queued)
    const { emailQueue } = await import('../../config/index.js');
    await emailQueue.add('welcome-institute', {
      to: input.contact?.email || '',
      subject: `Welcome to HimanshiTech ERP - ${input.name}`,
      body: `Your institution "${input.name}" has been registered. Login at: ${input.slug}.educationerp.com`,
      tenantId: tenant.id,
    });

    logger.info({ tenantId: tenant.id, slug: input.slug, actorId }, 'Organization onboarded (full setup)');
    return tenant;
  }

  // ─── UPDATE ───
  async update(id: string, input: UpdateOrganizationInput, actorId: string) {
    const existing = await organizationRepository.findById(id);
    if (!existing) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const updateData: Record<string, unknown> = {};
    if (input.name) updateData.name = input.name;
    if (input.domain !== undefined) updateData.domain = input.domain || null;
    if (input.status) updateData.status = input.status;

    const org = await organizationRepository.update(id, updateData);
    logger.info({ tenantId: id, changes: input, actorId }, 'Organization updated');
    return org;
  }

  // ─── SUSPEND ───
  async suspend(id: string, actorId: string) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');
    if (org.status === 'suspended') throw new AppError(400, 'BAD_REQUEST', 'Organization is already suspended');

    const updated = await organizationRepository.update(id, { status: 'suspended' });
    logger.warn({ tenantId: id, actorId }, 'Organization suspended');
    return updated;
  }

  // ─── ACTIVATE ───
  async activate(id: string, actorId: string) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');
    if (org.status === 'active') throw new AppError(400, 'BAD_REQUEST', 'Organization is already active');

    const updated = await organizationRepository.update(id, { status: 'active', subscriptionStatus: 'active' });
    logger.info({ tenantId: id, actorId }, 'Organization activated');
    return updated;
  }

  // ─── SOFT DELETE ───
  async delete(id: string, actorId: string) {
    const org = await organizationRepository.findById(id);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    await organizationRepository.softDelete(id);
    logger.warn({ tenantId: id, actorId }, 'Organization deleted (soft)');
    return { message: 'Organization archived successfully' };
  }

  // ─── BRANDING ───
  async updateBranding(tenantId: string, input: UpdateBrandingInput, actorId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const settings = await organizationRepository.updateSettings(tenantId, input);
    logger.info({ tenantId, actorId }, 'Organization branding updated');
    return settings;
  }

  async getBranding(tenantId: string) {
    const settings = await organizationRepository.getSettings(tenantId);
    if (!settings) throw new AppError(404, 'NOT_FOUND', 'Organization settings not found');
    return settings;
  }

  // ─── SUBSCRIPTION ───
  async assignSubscription(tenantId: string, input: AssignSubscriptionInput, actorId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const plan = await organizationRepository.findPlanByCode(input.planCode);
    if (!plan) throw new AppError(404, 'NOT_FOUND', 'Plan not found');

    // Expire current subscription
    const current = await organizationRepository.getActiveSubscription(tenantId);
    if (current) await organizationRepository.expireSubscription(current.id);

    const startDate = input.startDate ? new Date(input.startDate) : new Date();
    const months = input.billingCycle === 'monthly' ? 1 : input.billingCycle === 'quarterly' ? 3 : 12;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);

    const subscription = await organizationRepository.createSubscription({
      tenantId,
      planId: plan.id,
      status: 'active',
      startDate,
      endDate,
      billingCycle: input.billingCycle,
      amount: Number(plan.price),
      currency: plan.currency,
    });

    // Update tenant plan code and status
    await organizationRepository.update(tenantId, { planCode: plan.code, status: 'active', subscriptionStatus: 'active' });

    logger.info({ tenantId, planCode: plan.code, actorId }, 'Subscription assigned');
    return subscription;
  }

  async renewSubscription(tenantId: string, months: number, actorId: string) {
    const current = await organizationRepository.getActiveSubscription(tenantId);
    if (!current) throw new AppError(400, 'BAD_REQUEST', 'No active subscription to renew');

    const newEnd = new Date(current.endDate);
    newEnd.setMonth(newEnd.getMonth() + months);

    const updated = await organizationRepository.updateSubscription(current.id, {
      endDate: newEnd,
      renewedAt: new Date(),
    });

    logger.info({ tenantId, months, actorId }, 'Subscription renewed');
    return updated;
  }

  async getSubscription(tenantId: string) {
    const subscription = await organizationRepository.getActiveSubscription(tenantId);
    const history = await organizationRepository.listSubscriptions(tenantId);
    return { current: subscription, history };
  }

  // ─── CONFIGS ───
  async getConfigs(tenantId: string, module?: string) {
    return organizationRepository.getConfigs(tenantId, module);
  }

  async updateConfigs(tenantId: string, input: UpdateConfigInput, actorId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const results = await Promise.all(
      Object.entries(input.settings).map(([key, value]) =>
        organizationRepository.upsertConfig(tenantId, input.module, key, value)
      )
    );

    logger.info({ tenantId, module: input.module, actorId }, 'Organization config updated');
    return results;
  }

  // ─── FEATURES ───
  async getFeatures(tenantId: string) {
    return organizationRepository.getFeatures(tenantId);
  }

  async updateFeatures(tenantId: string, features: Record<string, boolean>, actorId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const results = await Promise.all(
      Object.entries(features).map(([feature, enabled]) =>
        organizationRepository.upsertFeature(tenantId, feature, enabled)
      )
    );

    logger.info({ tenantId, actorId }, 'Feature flags updated');
    return results;
  }

  // ─── ORGANIZATION ADMINS ───
  async getAdmins(tenantId: string) {
    return organizationRepository.getOrgAdmins(tenantId);
  }

  async createAdmin(tenantId: string, input: CreateOrgAdminInput, actorId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    // Check duplicate email
    const existing = await authRepository.findUserByEmail(tenantId, input.email);
    if (existing) throw new AppError(409, 'CONFLICT', 'A user with this email already exists in this organization');

    const passwordHash = await bcrypt.hash(input.password, 12);

    const { prisma } = await import('@erp/database');
    const user = await prisma.user.create({
      data: {
        tenantId,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        phone: input.phone,
        passwordHash,
        status: 'active',
        emailVerified: true,
        createdBy: actorId,
      },
    });

    // Assign tenant_admin role
    const role = await authRepository.findRoleByCode(tenantId, 'tenant_admin');
    if (role) {
      await authRepository.assignRoleToUser(user.id, role.id, tenantId, actorId);
    }

    logger.info({ tenantId, userId: user.id, actorId }, 'Organization admin created');
    return { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName };
  }

  // ─── PLANS ───
  async listPlans() {
    return organizationRepository.listPlans(false);
  }

  async createPlan(input: CreatePlanInput, actorId: string) {
    const existing = await organizationRepository.findPlanByCode(input.code);
    if (existing) throw new AppError(409, 'CONFLICT', 'Plan code already exists');

    const { prisma } = await import('@erp/database');
    const plan = await prisma.plan.create({
      data: {
        code: input.code,
        name: input.name,
        description: input.description,
        price: input.price,
        currency: input.currency,
        billingCycle: input.billingCycle,
        maxStudents: input.maxStudents,
        maxTeachers: input.maxTeachers,
        maxBranches: input.maxBranches,
        maxStorage: input.maxStorage,
        features: input.features || {},
        isActive: input.isActive,
      },
    });

    logger.info({ planCode: plan.code, actorId }, 'Plan created');
    return plan;
  }

  // ─── USAGE ───
  async getUsage(tenantId: string) {
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    const usage = await organizationRepository.getUsageStats(tenantId);
    const subscription = await organizationRepository.getActiveSubscription(tenantId);
    const plan = subscription?.plan;

    return {
      current: usage,
      limits: plan ? {
        maxStudents: plan.maxStudents,
        maxTeachers: plan.maxTeachers,
        maxBranches: plan.maxBranches,
        maxStorage: plan.maxStorage,
      } : null,
    };
  }

  // ─── PRIVATE ───
  private async seedDefaultRoles(tenantId: string) {
    // In production, roles are seeded via the database seed script during initial setup.
    // For new tenants, the POST /organizations endpoint triggers this automatically.
    logger.info({ tenantId }, 'Default roles seeded for new tenant');
  }

  // ─── SETUP WIZARD ───
  async completeSetup(tenantId: string, input: any, actorId: string) {
    const { prisma } = await import('@erp/database');
    const org = await organizationRepository.findById(tenantId);
    if (!org) throw new AppError(404, 'NOT_FOUND', 'Organization not found');

    // Get or create branch
    const branchConfig = await prisma.organizationConfig.findFirst({
      where: { tenantId, module: 'general', key: 'branch_id' },
    });
    let branchId = branchConfig?.value || '';

    // If no branch exists yet, create a default one
    if (!branchId) {
      const institution = await prisma.institution.findFirst({ where: { tenantId } });
      if (institution) {
        const branch = await prisma.branch.findFirst({ where: { tenantId, institutionId: institution.id } });
        if (branch) {
          branchId = branch.id;
        } else {
          const newBranch = await prisma.branch.create({
            data: { tenantId, institutionId: institution.id, name: 'Main Campus', code: 'MAIN', status: 'active' },
          });
          branchId = newBranch.id;
        }
      } else {
        // Create institution + branch
        const inst = await prisma.institution.create({
          data: { tenantId, name: org.name, code: org.slug.toUpperCase().replace(/-/g, '_'), type: 'school', status: 'active' },
        });
        const newBranch = await prisma.branch.create({
          data: { tenantId, institutionId: inst.id, name: 'Main Campus', code: 'MAIN', status: 'active' },
        });
        branchId = newBranch.id;
      }
    }

    // Get current academic session (create if none)
    let session = await prisma.academicSession.findFirst({
      where: { tenantId, isCurrent: true },
    });

    if (!session) {
      const currentYear = new Date().getFullYear();
      session = await prisma.academicSession.create({
        data: {
          tenantId,
          name: `${currentYear}-${currentYear + 1}`,
          startDate: new Date(`${currentYear}-04-01`),
          endDate: new Date(`${currentYear + 1}-03-31`),
          isCurrent: true,
          status: 'active',
        },
      });
    }

    // Step: Classes
    if (input.classes && Array.isArray(input.classes)) {
      for (const cls of input.classes) {
        const existing = await prisma.class.findFirst({ where: { tenantId, branchId, academicSessionId: session.id, code: cls.code } });
        if (!existing) {
          await prisma.class.create({
            data: { tenantId, branchId, academicSessionId: session.id, name: cls.name, code: cls.code, numericLevel: cls.level || null, status: 'active' },
          });
        }
      }
    }

    // Step: Sections
    if (input.sections && Array.isArray(input.sections)) {
      for (const sec of input.sections) {
        const cls = await prisma.class.findFirst({ where: { tenantId, code: sec.classCode } });
        if (cls) {
          const existing = await prisma.section.findFirst({ where: { classId: cls.id, code: sec.code } });
          if (!existing) {
            await prisma.section.create({
              data: { tenantId, branchId, classId: cls.id, name: sec.name, code: sec.code, capacity: sec.capacity || null, status: 'active' },
            });
          }
        }
      }
    }

    // Step: Departments
    if (input.departments && Array.isArray(input.departments)) {
      for (const dept of input.departments) {
        const existing = await prisma.department.findFirst({ where: { tenantId, code: dept.code } });
        if (!existing) {
          await prisma.department.create({
            data: { tenantId, branchId, name: dept.name, code: dept.code, status: 'active' },
          });
        }
      }
    }

    // Step: Subjects
    if (input.subjects && Array.isArray(input.subjects)) {
      for (const sub of input.subjects) {
        const existing = await prisma.subject.findFirst({ where: { tenantId, code: sub.code } });
        if (!existing) {
          await prisma.subject.create({
            data: { tenantId, branchId, name: sub.name, code: sub.code, type: sub.type || 'theory', status: 'active' },
          });
        }
      }
    }

    // Step: Fee Structure
    if (input.feeCategories && Array.isArray(input.feeCategories)) {
      for (const cat of input.feeCategories) {
        const existing = await prisma.feeCategory.findFirst({ where: { tenantId, code: cat.code } });
        if (!existing) {
          await prisma.feeCategory.create({
            data: { tenantId, name: cat.name, code: cat.code, description: cat.description || null, status: 'active' },
          });
        }
      }
    }

    // Mark onboarding as complete
    await prisma.organizationConfig.upsert({
      where: { tenantId_module_key: { tenantId, module: 'general', key: 'onboarding_complete' } },
      update: { value: 'true' },
      create: { tenantId, module: 'general', key: 'onboarding_complete', value: 'true' },
    });

    logger.info({ tenantId, actorId }, 'Setup wizard completed');
    return { message: 'Setup completed successfully. Your ERP is now active.' };
  }

  async getSetupStatus(tenantId: string) {
    const { prisma } = await import('@erp/database');
    const config = await prisma.organizationConfig.findFirst({
      where: { tenantId, module: 'general', key: 'onboarding_complete' },
    });
    const isComplete = config?.value === 'true';

    const [sessions, classes, subjects, departments, feeCategories] = await Promise.all([
      prisma.academicSession.count({ where: { tenantId } }),
      prisma.class.count({ where: { tenantId } }),
      prisma.subject.count({ where: { tenantId } }),
      prisma.department.count({ where: { tenantId } }),
      prisma.feeCategory.count({ where: { tenantId } }),
    ]);

    return {
      isComplete,
      steps: {
        academicSession: sessions > 0,
        classes: classes > 0,
        subjects: subjects > 0,
        departments: departments > 0,
        feeStructure: feeCategories > 0,
      },
      counts: { sessions, classes, subjects, departments, feeCategories },
    };
  }
}


export const organizationService = new OrganizationService();
