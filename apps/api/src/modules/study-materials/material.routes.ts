import { Router } from 'express';
import { materialController } from './material.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { createMaterialSchema, updateMaterialSchema, materialListQuerySchema } from './material.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['study_materials:view']);
const create = requirePermission(['study_materials:create']);
const edit = requirePermission(['study_materials:edit']);
const del = requirePermission(['study_materials:delete']);

router.get('/', view, validateRequest({ query: materialListQuerySchema }), materialController.list);
router.get('/:id', view, materialController.getById);
router.get('/:id/download', view, materialController.download);
router.post('/', create, validate(createMaterialSchema), materialController.create);
router.patch('/:id', edit, validate(updateMaterialSchema), materialController.update);
router.delete('/:id', del, materialController.delete);

export { router as materialRouter };
