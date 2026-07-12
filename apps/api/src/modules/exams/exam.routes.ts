import { Router } from 'express';
import { examController } from './exam.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { createExamSchema, updateExamSchema, createExamScheduleSchema, enterMarksSchema, createGradeSchema, examListQuerySchema } from './exam.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['exams:view']);
const create = requirePermission(['exams:create']);
const edit = requirePermission(['exams:edit']);
const approve = requirePermission(['exams:approve']);

// Exams
router.get('/', view, validateRequest({ query: examListQuerySchema }), examController.listExams);
router.get('/:id', view, examController.getExam);
router.post('/', create, validate(createExamSchema), examController.createExam);
router.post('/schedule', create, validate(createExamScheduleSchema), examController.createSchedule);
router.patch('/:id', edit, validate(updateExamSchema), examController.updateExam);
router.delete('/:id', edit, examController.deleteExam);

// Marks
router.post('/marks', edit, validate(enterMarksSchema), examController.enterMarks);
router.post('/:id/publish', approve, examController.publishResults);

// Results
router.get('/results', view, examController.getResults);
router.get('/results/student/:studentId', view, examController.getStudentResults);
router.get('/report-card/:studentId', view, examController.getReportCard);

// Grades
router.get('/grades', view, examController.listGrades);
router.post('/grades', create, validate(createGradeSchema), examController.createGrade);
router.delete('/grades/:id', edit, examController.deleteGrade);

// Analytics
router.get('/:id/analytics', view, examController.getExamAnalytics);
router.get('/performance/class', view, examController.getClassPerformance);

export { router as examRouter };
