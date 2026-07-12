import { Router } from 'express';
import { academicController } from './academic.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  createSessionSchema, updateSessionSchema, createDepartmentSchema, updateDepartmentSchema,
  createCourseSchema, updateCourseSchema, createClassSchema, updateClassSchema,
  createSectionSchema, updateSectionSchema, createSubjectSchema, updateSubjectSchema,
  createSubjectGroupSchema, assignClassTeacherSchema, assignSubjectTeacherSchema,
  createPromotionRuleSchema, createCalendarEventSchema, updateCalendarEventSchema,
} from './academic.schema.js';

const router = Router();
router.use(authenticate);

const view = requirePermission(['settings:view']);
const edit = requirePermission(['settings:configure']);

// Sessions
router.get('/sessions', view, academicController.listSessions);
router.post('/sessions', edit, validate(createSessionSchema), academicController.createSession);
router.patch('/sessions/:id', edit, validate(updateSessionSchema), academicController.updateSession);
router.post('/sessions/:id/set-current', edit, academicController.setCurrentSession);

// Departments
router.get('/departments', view, academicController.listDepartments);
router.post('/departments', edit, validate(createDepartmentSchema), academicController.createDepartment);
router.patch('/departments/:id', edit, validate(updateDepartmentSchema), academicController.updateDepartment);
router.delete('/departments/:id', edit, academicController.deleteDepartment);

// Courses / Streams
router.get('/courses', view, academicController.listCourses);
router.post('/courses', edit, validate(createCourseSchema), academicController.createCourse);
router.patch('/courses/:id', edit, validate(updateCourseSchema), academicController.updateCourse);
router.delete('/courses/:id', edit, academicController.deleteCourse);

// Classes
router.get('/classes', view, academicController.listClasses);
router.get('/classes/:id', view, academicController.getClass);
router.post('/classes', edit, validate(createClassSchema), academicController.createClass);
router.patch('/classes/:id', edit, validate(updateClassSchema), academicController.updateClass);
router.delete('/classes/:id', edit, academicController.deleteClass);

// Sections
router.get('/classes/:classId/sections', view, academicController.listSections);
router.post('/sections', edit, validate(createSectionSchema), academicController.createSection);
router.patch('/sections/:id', edit, validate(updateSectionSchema), academicController.updateSection);
router.delete('/sections/:id', edit, academicController.deleteSection);

// Subjects
router.get('/subjects', view, academicController.listSubjects);
router.post('/subjects', edit, validate(createSubjectSchema), academicController.createSubject);
router.patch('/subjects/:id', edit, validate(updateSubjectSchema), academicController.updateSubject);
router.delete('/subjects/:id', edit, academicController.deleteSubject);

// Subject Groups
router.get('/subject-groups', view, academicController.listSubjectGroups);
router.post('/subject-groups', edit, validate(createSubjectGroupSchema), academicController.createSubjectGroup);
router.delete('/subject-groups/:id', edit, academicController.deleteSubjectGroup);

// Class Teacher Assignment
router.get('/class-teachers', view, academicController.listClassTeachers);
router.post('/class-teachers', edit, validate(assignClassTeacherSchema), academicController.assignClassTeacher);

// Subject Teacher Assignment
router.get('/subject-teachers', view, academicController.listSubjectTeachers);
router.post('/subject-teachers', edit, validate(assignSubjectTeacherSchema), academicController.assignSubjectTeacher);

// Promotion Rules
router.get('/promotion-rules', view, academicController.listPromotionRules);
router.post('/promotion-rules', edit, validate(createPromotionRuleSchema), academicController.createPromotionRule);
router.delete('/promotion-rules/:id', edit, academicController.deletePromotionRule);

// Academic Calendar
router.get('/calendar', view, academicController.listCalendarEvents);
router.post('/calendar', edit, validate(createCalendarEventSchema), academicController.createCalendarEvent);
router.patch('/calendar/:id', edit, validate(updateCalendarEventSchema), academicController.updateCalendarEvent);
router.delete('/calendar/:id', edit, academicController.deleteCalendarEvent);

export { router as academicRouter };
