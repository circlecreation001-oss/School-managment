import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  sendNotificationSchema, broadcastSchema, createTemplateSchema, updateTemplateSchema,
  sendFromTemplateSchema, scheduleNotificationSchema, notificationListQuerySchema,
} from './notification.schema.js';

const router = Router();
router.use(authenticate);

const manage = requirePermission(['notifications:manage']);
const create = requirePermission(['notifications:create']);
const view = requirePermission(['notifications:view']);

// User's own notifications (any authenticated user)
router.get('/me', notificationController.getMyNotifications);
router.get('/me/unread-count', notificationController.getUnreadCount);
router.patch('/me/:id/read', notificationController.markAsRead);
router.post('/me/read-all', notificationController.markAllAsRead);

// Send
router.post('/send', create, validate(sendNotificationSchema), notificationController.send);
router.post('/send-template', create, validate(sendFromTemplateSchema), notificationController.sendFromTemplate);
router.post('/broadcast', manage, validate(broadcastSchema), notificationController.broadcast);
router.post('/schedule', create, validate(scheduleNotificationSchema), notificationController.schedule);

// Admin: list & stats
router.get('/', view, validateRequest({ query: notificationListQuerySchema }), notificationController.listAll);
router.get('/delivery-stats', view, notificationController.getDeliveryStats);

// Templates
router.get('/templates', view, notificationController.listTemplates);
router.post('/templates', manage, validate(createTemplateSchema), notificationController.createTemplate);
router.patch('/templates/:id', manage, validate(updateTemplateSchema), notificationController.updateTemplate);
router.delete('/templates/:id', manage, notificationController.deleteTemplate);

export { router as notificationRouter };
