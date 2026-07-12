import { Request, Response, NextFunction } from 'express';
import { academicService } from './academic.service.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';

export class AcademicController {
  // Sessions
  async listSessions(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listSessions(req.user!.tenantId)); } catch (e) { next(e); }
  }
  async createSession(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createSession(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateSession(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateSession(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async setCurrentSession(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.setCurrentSession(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Departments
  async listDepartments(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listDepartments(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }
  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createDepartment(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateDepartment(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteDepartment(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Courses
  async listCourses(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listCourses(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }
  async createCourse(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createCourse(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateCourse(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateCourse(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteCourse(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteCourse(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Classes
  async listClasses(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listClasses(req.user!.tenantId, req.query.branchId as string, req.query.sessionId as string)); } catch (e) { next(e); }
  }
  async getClass(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.getClass(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async createClass(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createClass(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateClass(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateClass(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteClass(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteClass(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Sections
  async listSections(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listSections(req.user!.tenantId, req.params.classId!)); } catch (e) { next(e); }
  }
  async createSection(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createSection(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateSection(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateSection(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteSection(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteSection(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Subjects
  async listSubjects(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listSubjects(req.user!.tenantId, req.query.branchId as string, req.query.classId as string)); } catch (e) { next(e); }
  }
  async createSubject(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createSubject(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateSubject(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateSubject(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteSubject(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteSubject(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Subject Groups
  async listSubjectGroups(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listSubjectGroups(req.user!.tenantId, req.query.classId as string)); } catch (e) { next(e); }
  }
  async createSubjectGroup(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createSubjectGroup(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteSubjectGroup(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteSubjectGroup(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Teacher Assignments
  async listClassTeachers(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listClassTeachers(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }
  async assignClassTeacher(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.assignClassTeacher(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async listSubjectTeachers(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listSubjectTeachers(req.user!.tenantId, req.query.classId as string)); } catch (e) { next(e); }
  }
  async assignSubjectTeacher(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.assignSubjectTeacher(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }

  // Promotion Rules
  async listPromotionRules(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listPromotionRules(req.user!.tenantId, req.query.branchId as string)); } catch (e) { next(e); }
  }
  async createPromotionRule(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createPromotionRule(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deletePromotionRule(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deletePromotionRule(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Calendar Events
  async listCalendarEvents(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.listCalendarEvents(req.user!.tenantId, req.query.branchId as string, req.query as any)); } catch (e) { next(e); }
  }
  async createCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await academicService.createCalendarEvent(req.user!.tenantId, req.query.branchId as string, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.updateCalendarEvent(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteCalendarEvent(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await academicService.deleteCalendarEvent(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
}

export const academicController = new AcademicController();
