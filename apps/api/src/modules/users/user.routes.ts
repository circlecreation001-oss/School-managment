import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  createUserSchema, updateUserSchema, updateProfileSchema,
  assignRoleSchema, bulkImportSchema, userListQuerySchema,
} from './user.schema.js';

const router = Router();
router.use(authenticate);

// Self-service profile
router.get('/me/profile', userController.updateProfile); // GET handled in auth/me
router.patch('/me/profile', validate(updateProfileSchema), userController.updateProfile);

// User CRUD
router.get('/', requirePermission(['users:view']), validateRequest({ query: userListQuerySchema }), userController.list);
router.get('/:id', requirePermission(['users:view']), userController.getById);
router.post('/', requirePermission(['users:create']), validate(createUserSchema), userController.create);
router.patch('/:id', requirePermission(['users:edit']), validate(updateUserSchema), userController.update);

// Status actions
router.post('/:id/activate', requirePermission(['users:edit']), userController.activate);
router.post('/:id/suspend', requirePermission(['users:edit']), userController.suspend);
router.post('/:id/archive', requirePermission(['users:delete']), userController.archive);
router.post('/:id/restore', requirePermission(['users:edit']), userController.restore);

// Password & sessions
router.post('/:id/reset-password', requirePermission(['users:edit']), userController.resetPassword);
router.post('/:id/force-logout', requirePermission(['users:edit']), userController.forceLogout);
router.get('/:id/sessions', requirePermission(['users:view']), userController.getSessions);
router.delete('/:id/sessions/:sessionId', requirePermission(['users:edit']), userController.revokeSession);

// Roles
router.get('/:id/roles', requirePermission(['users:view']), userController.getRoles);
router.post('/:id/roles', requirePermission(['users:edit']), validate(assignRoleSchema), userController.assignRole);
router.delete('/:id/roles/:roleId', requirePermission(['users:edit']), userController.removeRole);

// Activity
router.get('/:id/activity', requirePermission(['users:view']), userController.getActivity);
router.get('/:id/login-history', requirePermission(['users:view']), userController.getLoginHistory);

// Bulk operations
router.post('/bulk/import', requirePermission(['users:create']), validate(bulkImportSchema), userController.bulkImport);
router.get('/bulk/export', requirePermission(['users:export']), userController.exportUsers);

export { router as userRouter };
