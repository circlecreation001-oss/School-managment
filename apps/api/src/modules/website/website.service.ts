import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { websiteRepository } from './website.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreatePageInput, UpdatePageInput, CreateBlogPostInput, UpdateBlogPostInput, CreateGalleryItemInput, CreateEnquiryInput, BlogListQuery } from './website.schema.js';

export class WebsiteService {
  // ─── PAGES ───
  async listPages(tenantId: string, pageType?: string, isPublished?: boolean) {
    return websiteRepository.listPages(tenantId, pageType, isPublished);
  }

  async getPageBySlug(tenantId: string, slug: string) {
    const page = await websiteRepository.getPageBySlug(tenantId, slug);
    if (!page || page.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Page not found');
    return page;
  }

  async createPage(tenantId: string, input: CreatePageInput, actorId: string) {
    const existing = await websiteRepository.getPageBySlug(tenantId, input.slug);
    if (existing) throw new AppError(409, 'CONFLICT', 'A page with this slug already exists');
    const page = await websiteRepository.createPage({ tenantId, ...input });
    await this.audit(tenantId, actorId, 'website_page', page.id, 'create');
    return page;
  }

  async updatePage(tenantId: string, id: string, input: UpdatePageInput, actorId: string) {
    const page = await websiteRepository.getPageById(id);
    if (!page || page.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Page not found');
    const updated = await websiteRepository.updatePage(id, input);
    await this.audit(tenantId, actorId, 'website_page', id, 'update');
    return updated;
  }

  async deletePage(tenantId: string, id: string, actorId: string) {
    const page = await websiteRepository.getPageById(id);
    if (!page || page.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Page not found');
    await websiteRepository.deletePage(id);
    await this.audit(tenantId, actorId, 'website_page', id, 'delete');
    return { message: 'Page deleted' };
  }

  // ─── BLOG ───
  async listBlogPosts(tenantId: string, query: BlogListQuery) {
    const { data, total } = await websiteRepository.listBlogPosts(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  async getBlogBySlug(tenantId: string, slug: string) {
    const post = await websiteRepository.getBlogBySlug(tenantId, slug);
    if (!post || post.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Blog post not found');
    return post;
  }

  async createBlogPost(tenantId: string, input: CreateBlogPostInput, actorId: string) {
    const existing = await websiteRepository.getBlogBySlug(tenantId, input.slug);
    if (existing) throw new AppError(409, 'CONFLICT', 'A post with this slug already exists');
    const data: any = { tenantId, ...input };
    if (input.isPublished) data.publishedAt = new Date();
    const post = await websiteRepository.createBlogPost(data);
    await this.audit(tenantId, actorId, 'blog_post', post.id, 'create');
    return post;
  }

  async updateBlogPost(tenantId: string, id: string, input: UpdateBlogPostInput, actorId: string) {
    const post = await websiteRepository.getBlogById(id);
    if (!post || post.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Post not found');
    const data: any = { ...input };
    if (input.isPublished && !post.publishedAt) data.publishedAt = new Date();
    const updated = await websiteRepository.updateBlogPost(id, data);
    await this.audit(tenantId, actorId, 'blog_post', id, 'update');
    return updated;
  }

  async deleteBlogPost(tenantId: string, id: string, actorId: string) {
    const post = await websiteRepository.getBlogById(id);
    if (!post || post.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Post not found');
    await websiteRepository.deleteBlogPost(id);
    await this.audit(tenantId, actorId, 'blog_post', id, 'delete');
    return { message: 'Blog post deleted' };
  }

  async getBlogCategories(tenantId: string) { return websiteRepository.getBlogCategories(tenantId); }

  // ─── GALLERY ───
  async listGallery(tenantId: string, category?: string) {
    return websiteRepository.listGalleryItems(tenantId, category);
  }

  async addGalleryItem(tenantId: string, input: CreateGalleryItemInput, actorId: string) {
    const item = await websiteRepository.createGalleryItem({ tenantId, ...input });
    await this.audit(tenantId, actorId, 'gallery', item.id, 'create');
    return item;
  }

  async deleteGalleryItem(tenantId: string, id: string, actorId: string) {
    await websiteRepository.deleteGalleryItem(id);
    await this.audit(tenantId, actorId, 'gallery', id, 'delete');
    return { message: 'Gallery item deleted' };
  }

  async getGalleryCategories(tenantId: string) { return websiteRepository.getGalleryCategories(tenantId); }

  // ─── ENQUIRIES ───
  async listEnquiries(tenantId: string, status?: string) {
    return websiteRepository.listEnquiries(tenantId, status);
  }

  async submitEnquiry(tenantId: string, input: CreateEnquiryInput) {
    const enquiry = await websiteRepository.createEnquiry({ tenantId, ...input });
    logger.info({ tenantId, enquiryId: enquiry.id }, 'New contact enquiry submitted');
    return enquiry;
  }

  async updateEnquiryStatus(tenantId: string, id: string, status: string, actorId: string) {
    await websiteRepository.updateEnquiryStatus(id, status);
    await this.audit(tenantId, actorId, 'enquiry', id, 'status_update', { status });
    return { message: 'Enquiry status updated' };
  }

  // ─── PRIVATE ───
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: metadata || undefined } });
  }
}

export const websiteService = new WebsiteService();
