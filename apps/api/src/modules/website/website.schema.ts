import { z } from 'zod';

// ─── Pages ───
export const createPageSchema = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200).trim(),
  content: z.string().optional(),
  pageType: z.enum(['home', 'about', 'courses', 'admissions', 'contact', 'faculty', 'careers', 'blog', 'gallery', 'events', 'custom']),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).default(0),
});
export const updatePageSchema = createPageSchema.partial().omit({ slug: true });

// ─── Blog ───
export const createBlogPostSchema = z.object({
  slug: z.string().min(1).max(150).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(300).trim(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  authorName: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  tags: z.array(z.string().max(30)).max(10).optional(),
  featuredImage: z.string().url().optional().or(z.literal('')),
  isPublished: z.boolean().default(false),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
});
export const updateBlogPostSchema = createBlogPostSchema.partial().omit({ slug: true });

// ─── Gallery ───
export const createGalleryItemSchema = z.object({
  title: z.string().max(200).optional(),
  imageUrl: z.string().url(),
  category: z.string().max(50).optional(),
  altText: z.string().max(200).optional(),
  sortOrder: z.number().int().min(0).default(0),
  isPublished: z.boolean().default(true),
});

// ─── Contact Enquiry ───
export const createEnquirySchema = z.object({
  fullName: z.string().min(1).max(100).trim(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(50).optional(),
});

// ─── Query ───
export const pageListQuerySchema = z.object({
  pageType: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export const blogListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.string().optional(),
  isPublished: z.coerce.boolean().optional(),
});

export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>;
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>;
export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type BlogListQuery = z.infer<typeof blogListQuerySchema>;
