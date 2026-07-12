import { Router } from 'express';
import { homeworkController } from './homework.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { createHomeworkSchema, updateHomeworkSchema, submitHomeworkSchema, reviewSubmissionSchema, homeworkListQuerySchema } from './homework.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['homework:view']);
const create = requirePermission(['homework:create']);
const edit = requirePermission(['homework:edit']);

router.get('/', view, validateRequest({ query: homeworkListQuerySchema }), homeworkController.list);
router.get('/:id', view, homeworkController.getById);
router.post('/', create, validate(createHomeworkSchema), homeworkController.create);
router.patch('/:id', edit, validate(updateHomeworkSchema), homeworkController.update);
router.delete('/:id', edit, homeworkController.delete);
router.post('/:id/publish', edit, homeworkController.publish);
router.post('/:id/close', edit, homeworkController.close);

// Submissions
router.post('/:id/submit', view, validate(submitHomeworkSchema), homeworkController.submit);
router.get('/:id/submissions', view, homeworkController.getSubmissions);
router.patch('/submissions/:submissionId/review', edit, validate(reviewSubmissionSchema), homeworkController.review);
router.get('/student/:studentId/submissions', view, homeworkController.getStudentSubmissions);

export { router as homeworkRouter };
