import { Router } from 'express';
import { websiteController } from './website.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requirePermission } from '../../middleware/rbac.middleware.js';
import { validate, validateRequest } from '../../middleware/validate.middleware.js';
import { createPageSchema, updatePageSchema, createBlogPostSchema, updateBlogPostSchema, createGalleryItemSchema, createEnquirySchema, blogListQuerySchema } from './website.schema.js';

const router = Router();

// ─── PUBLIC endpoints (no auth) ───
router.get('/public/pages/:slug', websiteController.getPublicPage);
router.get('/public/blog/:slug', websiteController.getPublicBlog);
router.post('/public/enquiry', validate(createEnquirySchema), websiteController.submitEnquiry);

// ─── ADMIN endpoints (auth required) ───
router.use(authenticate);
const view = requirePermission(['website:view']);
const edit = requirePermission(['website:edit']);
const create = requirePermission(['website:create']);
const del = requirePermission(['website:delete']);

// Pages
router.get('/pages', view, websiteController.listPages);
router.get('/pages/:slug', view, websiteController.getPage);
router.post('/pages', create, validate(createPageSchema), websiteController.createPage);
router.patch('/pages/:id', edit, validate(updatePageSchema), websiteController.updatePage);
router.delete('/pages/:id', del, websiteController.deletePage);

// Blog
router.get('/blog', view, validateRequest({ query: blogListQuerySchema }), websiteController.listBlog);
router.get('/blog/categories', view, websiteController.getBlogCategories);
router.get('/blog/:slug', view, websiteController.getBlogPost);
router.post('/blog', create, validate(createBlogPostSchema), websiteController.createBlogPost);
router.patch('/blog/:id', edit, validate(updateBlogPostSchema), websiteController.updateBlogPost);
router.delete('/blog/:id', del, websiteController.deleteBlogPost);

// Gallery
router.get('/gallery', view, websiteController.listGallery);
router.get('/gallery/categories', view, websiteController.getGalleryCategories);
router.post('/gallery', create, validate(createGalleryItemSchema), websiteController.addGalleryItem);
router.delete('/gallery/:id', del, websiteController.deleteGalleryItem);

// Enquiries
router.get('/enquiries', view, websiteController.listEnquiries);
router.patch('/enquiries/:id/status', edit, websiteController.updateEnquiryStatus);

export { router as websiteRouter };
