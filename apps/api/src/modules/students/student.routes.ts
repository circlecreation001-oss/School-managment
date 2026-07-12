import { Router } from 'express';
import { studentController } from './student.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  createAdmissionSchema, updateStudentSchema, upsertParentSchema,
  uploadDocumentSchema, promoteStudentsSchema, transferStudentSchema,
  bulkImportStudentsSchema, studentListQuerySchema,
} from './student.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['students:view']);
const create = requirePermission(['students:create']);
const edit = requirePermission(['students:edit']);
const del = requirePermission(['students:delete']);
const exp = requirePermission(['students:export']);

// CRUD
router.get('/', view, validateRequest({ query: studentListQuerySchema }), studentController.list);
router.get('/stats', view, studentController.getStats);
router.get('/export', exp, studentController.exportStudents);
router.get('/:id', view, studentController.getById);
router.post('/', create, validate(createAdmissionSchema), studentController.admit);
router.patch('/:id', edit, validate(updateStudentSchema), studentController.update);
router.delete('/:id', del, studentController.archive);

// Parents
router.get('/:id/parents', view, studentController.getParents);
router.post('/:id/parents', edit, validate(upsertParentSchema), studentController.addParent);
router.delete('/:id/parents/:parentId', edit, studentController.removeParent);

// Documents
router.get('/:id/documents', view, studentController.getDocuments);
router.post('/:id/documents', edit, validate(uploadDocumentSchema), studentController.addDocument);
router.delete('/:id/documents/:docId', edit, studentController.deleteDocument);
router.post('/:id/documents/:docId/verify', requirePermission(['students:approve']), studentController.verifyDocument);

// Promotion & Transfer
router.post('/promote', requirePermission(['students:approve']), validate(promoteStudentsSchema), studentController.promote);
router.post('/:id/transfer', requirePermission(['students:approve']), validate(transferStudentSchema), studentController.transfer);

// Certificates & Timeline
router.get('/:id/certificates', view, studentController.getCertificates);
router.get('/:id/timeline', view, studentController.getTimeline);

// Bulk
router.post('/bulk/import', create, validate(bulkImportStudentsSchema), studentController.bulkImport);

export { router as studentRouter };
