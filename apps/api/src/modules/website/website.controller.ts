import { Request, Response, NextFunction } from 'express';
import { websiteService } from './website.service.js';
import { sendSuccess, sendCreated, sendList } from '../../utils/response.js';

export class WebsiteController {
  // Pages
  async listPages(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.listPages(req.user!.tenantId, req.query.pageType as string, req.query.isPublished === 'true' ? true : undefined)); } catch (e) { next(e); }
  }
  async getPage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.getPageBySlug(req.user!.tenantId, req.params.slug!)); } catch (e) { next(e); }
  }
  async createPage(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await websiteService.createPage(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updatePage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.updatePage(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deletePage(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.deletePage(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }

  // Blog
  async listBlog(req: Request, res: Response, next: NextFunction) {
    try { const r = await websiteService.listBlogPosts(req.user!.tenantId, req.query as any); sendList(res, r.data, r.meta); } catch (e) { next(e); }
  }
  async getBlogPost(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.getBlogBySlug(req.user!.tenantId, req.params.slug!)); } catch (e) { next(e); }
  }
  async createBlogPost(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await websiteService.createBlogPost(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async updateBlogPost(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.updateBlogPost(req.user!.tenantId, req.params.id!, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteBlogPost(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.deleteBlogPost(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async getBlogCategories(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.getBlogCategories(req.user!.tenantId)); } catch (e) { next(e); }
  }

  // Gallery
  async listGallery(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.listGallery(req.user!.tenantId, req.query.category as string)); } catch (e) { next(e); }
  }
  async addGalleryItem(req: Request, res: Response, next: NextFunction) {
    try { sendCreated(res, await websiteService.addGalleryItem(req.user!.tenantId, req.body, req.user!.id)); } catch (e) { next(e); }
  }
  async deleteGalleryItem(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.deleteGalleryItem(req.user!.tenantId, req.params.id!, req.user!.id)); } catch (e) { next(e); }
  }
  async getGalleryCategories(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.getGalleryCategories(req.user!.tenantId)); } catch (e) { next(e); }
  }

  // Enquiries
  async listEnquiries(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.listEnquiries(req.user!.tenantId, req.query.status as string)); } catch (e) { next(e); }
  }
  async submitEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      // Public endpoint — tenantId from header
      const tenantId = req.tenantId || req.headers['x-tenant-id'] as string;
      if (!tenantId) { res.status(400).json({ success: false, error: { code: 'TENANT_REQUIRED', message: 'x-tenant-id header required' } }); return; }
      sendCreated(res, await websiteService.submitEnquiry(tenantId, req.body), 'Enquiry submitted');
    } catch (e) { next(e); }
  }
  async updateEnquiryStatus(req: Request, res: Response, next: NextFunction) {
    try { sendSuccess(res, await websiteService.updateEnquiryStatus(req.user!.tenantId, req.params.id!, req.body.status, req.user!.id)); } catch (e) { next(e); }
  }

  // Public pages (no auth required)
  async getPublicPage(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId || req.headers['x-tenant-id'] as string;
      if (!tenantId) { res.status(400).json({ success: false, error: { code: 'TENANT_REQUIRED', message: 'x-tenant-id header required' } }); return; }
      const page = await websiteService.getPageBySlug(tenantId, req.params.slug!);
      if (!page.isPublished) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Page not found' } }); return; }
      sendSuccess(res, page);
    } catch (e) { next(e); }
  }

  async getPublicBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = req.tenantId || req.headers['x-tenant-id'] as string;
      if (!tenantId) { res.status(400).json({ success: false, error: { code: 'TENANT_REQUIRED', message: 'x-tenant-id header required' } }); return; }
      const post = await websiteService.getBlogBySlug(tenantId, req.params.slug!);
      if (!post.isPublished) { res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Post not found' } }); return; }
      sendSuccess(res, post);
    } catch (e) { next(e); }
  }
}

export const websiteController = new WebsiteController();
