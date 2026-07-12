import { Router } from 'express';
import { organizationController } from './organization.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createOrganizationSchema, updateOrganizationSchema, updateBrandingSchema,
  assignSubscriptionSchema, renewSubscriptionSchema, updateConfigSchema,
  createOrgAdminSchema, createPlanSchema,
} from './organization.schema.js';

const router = Router();

// All routes require auth + super_admin or tenant_admin
router.use(authenticate);

// ─── Plans (super_admin only) ───
router.get('/plans', organizationController.listPlans);
router.post('/plans', requireRole('super_admin'), validate(createPlanSchema), organizationController.createPlan);

// ─── Organization CRUD ───
router.get('/', requireRole('super_admin'), organizationController.list);
router.get('/:id', requireRole('super_admin', 'tenant_admin'), organizationController.getById);
router.post('/', requireRole('super_admin'), validate(createOrganizationSchema), organizationController.create);
router.patch('/:id', requireRole('super_admin'), validate(updateOrganizationSchema), organizationController.update);
router.post('/:id/suspend', requireRole('super_admin'), organizationController.suspend);
router.post('/:id/activate', requireRole('super_admin'), organizationController.activate);
router.delete('/:id', requireRole('super_admin'), organizationController.delete);

// ─── Branding ───
router.get('/:id/branding', requireRole('super_admin', 'tenant_admin'), organizationController.getBranding);
router.patch('/:id/branding', requireRole('super_admin', 'tenant_admin'), validate(updateBrandingSchema), organizationController.updateBranding);

// ─── Subscription ───
router.get('/:id/subscription', requireRole('super_admin', 'tenant_admin'), organizationController.getSubscription);
router.post('/:id/subscription', requireRole('super_admin'), validate(assignSubscriptionSchema), organizationController.assignSubscription);
router.post('/:id/subscription/renew', requireRole('super_admin'), validate(renewSubscriptionSchema), organizationController.renewSubscription);

// ─── Config ───
router.get('/:id/config', requireRole('super_admin', 'tenant_admin'), organizationController.getConfigs);
router.put('/:id/config', requireRole('super_admin', 'tenant_admin'), validate(updateConfigSchema), organizationController.updateConfigs);

// ─── Features ───
router.get('/:id/features', requireRole('super_admin', 'tenant_admin'), organizationController.getFeatures);
router.patch('/:id/features', requireRole('super_admin'), organizationController.updateFeatures);

// ─── Admins ───
router.get('/:id/admins', requireRole('super_admin'), organizationController.getAdmins);
router.post('/:id/admins', requireRole('super_admin'), validate(createOrgAdminSchema), organizationController.createAdmin);

// ─── Usage ───
router.get('/:id/usage', requireRole('super_admin', 'tenant_admin'), organizationController.getUsage);

// ─── Setup Wizard ───
router.get('/:id/setup-status', requireRole('super_admin', 'tenant_admin', 'institution_admin'), organizationController.getSetupStatus);
router.post('/:id/setup-complete', requireRole('super_admin', 'tenant_admin', 'institution_admin'), organizationController.completeSetup);

export { router as organizationRouter };
