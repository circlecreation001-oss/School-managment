import { Request, Response, NextFunction } from 'express';
import { libraryService } from './library.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class LibraryController {
  // Books
  async listBooks(req: Request, res: Response, next: NextFunction) {
    try { const r = await libraryService.listBooks(req.user!.tenantId, req.query as any); sendList(res, r.data, r.meta); } catch (e) { next(e); }
  }
  async getBook(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.getBook(req.user!.tenantId, req.params.id!)); } catch (e) { next(e); }
  }
  async createBook(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await libraryService.createBook(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateBook(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.updateBook(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteBook(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.deleteBook(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async findByBarcode(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.findByBarcode(req.user!.tenantId, req.params.barcode!)); } catch (e) { next(e); }
  }

  // Issue & Return
  async issueBook(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await libraryService.issueBook(req.user!.tenantId, req.body, req.user!.id), 'Book issued'); } catch (e) { next(e); }
  }
  async returnBook(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.returnBook(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async collectFine(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.collectFine(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async listIssues(req: Request, res: Response, next: NextFunction) {
    try { const r = await libraryService.listIssues(req.user!.tenantId, req.query as any); sendList(res, r.data, r.meta); } catch (e) { next(e); }
  }

  // Reports
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.getInventoryStats(req.user!.tenantId)); } catch (e) { next(e); }
  }
  async getOverdue(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.getOverdueList(req.user!.tenantId)); } catch (e) { next(e); }
  }
  async getMostIssued(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await libraryService.getMostIssued(req.user!.tenantId)); } catch (e) { next(e); }
  }
}

export const libraryController = new LibraryController();
