import { Router } from 'express';
import { superAdminController } from './super-admin.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireRole } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createTenantSchema, updateTenantSchema, tenantBrandingSchema,
  updateUserStatusSchema, createAnnouncementSchema,
} from './super-admin.schema.js';

const router = Router();

// All super-admin routes require authentication + super_admin role
router.use(authenticate);
router.use(requireRole('super_admin'));

// Dashboard
router.get('/dashboard', superAdminController.getDashboard);

// Tenant (Organization) Management
router.get('/tenants', superAdminController.listTenants);
router.get('/tenants/:id', superAdminController.getTenant);
router.post('/tenants', validate(createTenantSchema), superAdminController.createTenant);
router.patch('/tenants/:id', validate(updateTenantSchema), superAdminController.updateTenant);
router.post('/tenants/:id/suspend', superAdminController.suspendTenant);
router.post('/tenants/:id/activate', superAdminController.activateTenant);
router.delete('/tenants/:id', superAdminController.deleteTenant);
router.patch('/tenants/:id/branding', validate(tenantBrandingSchema), superAdminController.updateBranding);
router.patch('/tenants/:id/features', superAdminController.updateFeatures);

// User Management
router.get('/users', superAdminController.listUsers);
router.patch('/users/:id/status', validate(updateUserStatusSchema), superAdminController.updateUserStatus);
router.post('/users/:id/force-logout', superAdminController.forceLogoutUser);
router.post('/users/:id/reset-password', superAdminController.resetUserPassword);

// Audit Logs
router.get('/audit-logs', superAdminController.listAuditLogs);

// Announcements
router.post('/announcements', validate(createAnnouncementSchema), superAdminController.createAnnouncement);

export { router as superAdminRouter };
