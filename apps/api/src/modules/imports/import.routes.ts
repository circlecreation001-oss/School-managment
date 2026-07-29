import { Router } from 'express';
import { importController } from './import.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';

const router = Router();
router.use(authenticate);

const importPerm = requirePermission(['students:create', 'teachers:create']);

// Column mapping detection
router.post('/detect', importPerm, importController.detectMappings);

// Validate before import
router.post('/validate', importPerm, importController.validateData);

// Execute import
router.post('/process', importPerm, importController.processImport);

// Templates
router.get('/templates/:entity', importController.getTemplate);

// History
router.get('/history', importController.getHistory);

export { router as importRouter };
