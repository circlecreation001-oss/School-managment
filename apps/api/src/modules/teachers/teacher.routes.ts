import { Router } from 'express';
import { teacherController } from './teacher.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import {
  createTeacherSchema, updateTeacherSchema, addQualificationSchema,
  addExperienceSchema, assignSubjectsSchema, updateSalarySchema,
  uploadDocumentSchema, teacherListQuerySchema,
} from './teacher.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['teachers:view']);
const edit = requirePermission(['teachers:edit']);
const create = requirePermission(['teachers:create']);
const del = requirePermission(['teachers:delete']);

// CRUD
router.get('/', view, validateRequest({ query: teacherListQuerySchema }), teacherController.list);
router.get('/:id', view, teacherController.getById);
router.post('/', create, validate(createTeacherSchema), teacherController.create);
router.patch('/:id', edit, validate(updateTeacherSchema), teacherController.update);
router.delete('/:id', del, teacherController.archive);

// Qualifications
router.get('/:id/qualifications', view, teacherController.getQualifications);
router.post('/:id/qualifications', edit, validate(addQualificationSchema), teacherController.addQualification);
router.delete('/:id/qualifications/:qId', edit, teacherController.deleteQualification);

// Experience
router.get('/:id/experiences', view, teacherController.getExperiences);
router.post('/:id/experiences', edit, validate(addExperienceSchema), teacherController.addExperience);
router.delete('/:id/experiences/:expId', edit, teacherController.deleteExperience);

// Salary
router.get('/:id/salary', view, teacherController.getSalary);
router.put('/:id/salary', edit, validate(updateSalarySchema), teacherController.updateSalary);

// Subjects
router.get('/:id/subjects', view, teacherController.getSubjects);
router.put('/:id/subjects', edit, validate(assignSubjectsSchema), teacherController.assignSubjects);

// Documents
router.get('/:id/documents', view, teacherController.getDocuments);
router.post('/:id/documents', edit, validate(uploadDocumentSchema), teacherController.addDocument);
router.delete('/:id/documents/:docId', edit, teacherController.deleteDocument);

// Timetable, Attendance, Leave
router.get('/:id/timetable', view, teacherController.getTimetable);
router.get('/:id/attendance', view, teacherController.getAttendance);
router.get('/:id/leaves', view, teacherController.getLeaves);
router.get('/:id/leave-stats', view, teacherController.getLeaveStats);

// Timeline
router.get('/:id/timeline', view, teacherController.getTimeline);

export { router as teacherRouter };
