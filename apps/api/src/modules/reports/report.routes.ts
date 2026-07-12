import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { attendanceReportSchema, feeReportSchema, studentReportSchema, exportSchema } from './report.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['reports:view']);
const exp = requirePermission(['reports:export']);

router.get('/dashboard', view, reportController.getDashboard);
router.get('/attendance', view, validateRequest({ query: attendanceReportSchema }), reportController.getAttendanceReport);
router.get('/fees', view, validateRequest({ query: feeReportSchema }), reportController.getFeeReport);
router.get('/revenue', view, reportController.getRevenueReport);
router.get('/students', view, validateRequest({ query: studentReportSchema }), reportController.getStudentReport);
router.get('/teachers', view, reportController.getTeacherReport);
router.get('/exam-results', view, reportController.getExamResultsReport);
router.post('/export', exp, validate(exportSchema), reportController.exportReport);

export { router as reportRouter };
