import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class WebsiteRepository {
  // ─── Pages ───
  async listPages(tenantId: string, pageType?: string, isPublished?: boolean) {
    const where: Prisma.WebsitePageWhereInput = { tenantId, deletedAt: null };
    if (pageType) where.pageType = pageType;
    if (isPublished !== undefined) where.isPublished = isPublished;
    return prisma.websitePage.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async getPageBySlug(tenantId: string, slug: string) {
    return prisma.websitePage.findUnique({ where: { tenantId_slug: { tenantId, slug } } });
  }

  async getPageById(id: string) {
    return prisma.websitePage.findUnique({ where: { id } });
  }

  async createPage(data: Prisma.WebsitePageUncheckedCreateInput) {
    return prisma.websitePage.create({ data });
  }

  async updatePage(id: string, data: Prisma.WebsitePageUpdateInput) {
    return prisma.websitePage.update({ where: { id }, data });
  }

  async deletePage(id: string) {
    return prisma.websitePage.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ─── Blog ───
  async listBlogPosts(tenantId: string, params: { page: number; limit: number; category?: string; isPublished?: boolean }) {
    const where: Prisma.BlogPostWhereInput = { tenantId, deletedAt: null };
    if (params.category) where.category = params.category;
    if (params.isPublished !== undefined) where.isPublished = params.isPublished;

    const [data, total] = await Promise.all([
      prisma.blogPost.findMany({
        where, skip: (params.page - 1) * params.limit, take: params.limit,
        orderBy: { publishedAt: 'desc' },
      }),
      prisma.blogPost.count({ where }),
    ]);
    return { data, total };
  }

  async getBlogBySlug(tenantId: string, slug: string) {
    return prisma.blogPost.findUnique({ where: { tenantId_slug: { tenantId, slug } } });
  }

  async getBlogById(id: string) { return prisma.blogPost.findUnique({ where: { id } }); }

  async createBlogPost(data: Prisma.BlogPostUncheckedCreateInput) {
    return prisma.blogPost.create({ data });
  }

  async updateBlogPost(id: string, data: Prisma.BlogPostUpdateInput) {
    return prisma.blogPost.update({ where: { id }, data });
  }

  async deleteBlogPost(id: string) {
    return prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async getBlogCategories(tenantId: string) {
    const posts = await prisma.blogPost.findMany({
      where: { tenantId, deletedAt: null, isPublished: true, category: { not: null } },
      select: { category: true }, distinct: ['category'],
    });
    return posts.map((p) => p.category).filter(Boolean);
  }

  // ─── Gallery ───
  async listGalleryItems(tenantId: string, category?: string, publishedOnly = true) {
    const where: Prisma.GalleryItemWhereInput = { tenantId };
    if (category) where.category = category;
    if (publishedOnly) where.isPublished = true;
    return prisma.galleryItem.findMany({ where, orderBy: { sortOrder: 'asc' } });
  }

  async createGalleryItem(data: Prisma.GalleryItemUncheckedCreateInput) {
    return prisma.galleryItem.create({ data });
  }

  async deleteGalleryItem(id: string) {
    return prisma.galleryItem.delete({ where: { id } });
  }

  async getGalleryCategories(tenantId: string) {
    const items = await prisma.galleryItem.findMany({
      where: { tenantId, isPublished: true, category: { not: null } },
      select: { category: true }, distinct: ['category'],
    });
    return items.map((i) => i.category).filter(Boolean);
  }

  // ─── Contact Enquiries ───
  async listEnquiries(tenantId: string, status?: string) {
    const where: Prisma.ContactEnquiryWhereInput = { tenantId };
    if (status) where.status = status;
    return prisma.contactEnquiry.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async createEnquiry(data: Prisma.ContactEnquiryUncheckedCreateInput) {
    return prisma.contactEnquiry.create({ data });
  }

  async updateEnquiryStatus(id: string, status: string) {
    return prisma.contactEnquiry.update({ where: { id }, data: { status } });
  }
}

export const websiteRepository = new WebsiteRepository();
