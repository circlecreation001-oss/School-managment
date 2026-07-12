import { Router } from 'express';
import { attendanceController } from './attendance.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  markBulkAttendanceSchema, markSingleAttendanceSchema,
  markTeacherAttendanceSchema, markStaffAttendanceSchema,
  qrCheckInSchema, dailyAttendanceQuerySchema, monthlyReportQuerySchema, analyticsQuerySchema,
} from './attendance.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['attendance:view']);
const mark = requirePermission(['attendance:create']);

// ─── Mark Attendance ───
router.post('/students/bulk', mark, validate(markBulkAttendanceSchema), attendanceController.markBulkStudent);
router.post('/students/:studentId', mark, validate(markSingleAttendanceSchema), attendanceController.markSingleStudent);
router.post('/teachers', mark, validate(markTeacherAttendanceSchema), attendanceController.markTeacher);
router.post('/staff', mark, validate(markStaffAttendanceSchema), attendanceController.markStaff);
router.post('/check-in', mark, validate(qrCheckInSchema), attendanceController.qrCheckIn);

// ─── Query ───
router.get('/students/daily', view, validateRequest({ query: dailyAttendanceQuerySchema }), attendanceController.getDailyStudent);
router.get('/teachers/daily', view, attendanceController.getDailyTeacher);
router.get('/staff/daily', view, attendanceController.getDailyStaff);
router.get('/monthly', view, validateRequest({ query: monthlyReportQuerySchema }), attendanceController.getMonthlyReport);
router.get('/analytics', view, validateRequest({ query: analyticsQuerySchema }), attendanceController.getAnalytics);
router.get('/absentees', view, attendanceController.getAbsentees);
router.get('/holidays', view, attendanceController.getHolidays);

export { router as attendanceRouter };
