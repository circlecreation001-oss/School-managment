import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WebsiteService } from '../website.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  listPages: vi.fn().mockResolvedValue([]),
  getPageBySlug: vi.fn(),
  getPageById: vi.fn(),
  createPage: vi.fn().mockResolvedValue({ id: 'p1', slug: 'about', title: 'About Us' }),
  updatePage: vi.fn().mockResolvedValue({ id: 'p1' }),
  deletePage: vi.fn(),
  listBlogPosts: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getBlogBySlug: vi.fn(),
  getBlogById: vi.fn(),
  createBlogPost: vi.fn().mockResolvedValue({ id: 'b1', slug: 'hello', title: 'Hello World' }),
  updateBlogPost: vi.fn().mockResolvedValue({ id: 'b1' }),
  deleteBlogPost: vi.fn(),
  getBlogCategories: vi.fn().mockResolvedValue(['News', 'Events']),
  listGalleryItems: vi.fn().mockResolvedValue([]),
  createGalleryItem: vi.fn().mockResolvedValue({ id: 'g1' }),
  deleteGalleryItem: vi.fn(),
  getGalleryCategories: vi.fn().mockResolvedValue(['Campus']),
  listEnquiries: vi.fn().mockResolvedValue([]),
  createEnquiry: vi.fn().mockResolvedValue({ id: 'e1', fullName: 'John' }),
  updateEnquiryStatus: vi.fn(),
};
vi.mock('../website.repository.js', () => ({ websiteRepository: mockRepo }));

describe('WebsiteService', () => {
  let service: WebsiteService;
  beforeEach(() => { service = new WebsiteService(); vi.clearAllMocks(); });

  it('creates a page', async () => {
    mockRepo.getPageBySlug.mockResolvedValue(null);
    const r = await service.createPage('t1', { slug: 'about', title: 'About Us', pageType: 'about', isPublished: true } as any, 'actor');
    expect(r.slug).toBe('about');
  });

  it('rejects duplicate page slug', async () => {
    mockRepo.getPageBySlug.mockResolvedValue({ id: 'existing' });
    await expect(service.createPage('t1', { slug: 'about', title: 'X', pageType: 'about' } as any, 'actor')).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('creates blog post with publishedAt when published', async () => {
    mockRepo.getBlogBySlug.mockResolvedValue(null);
    await service.createBlogPost('t1', { slug: 'hello', title: 'Hello', isPublished: true } as any, 'actor');
    expect(mockRepo.createBlogPost).toHaveBeenCalledWith(expect.objectContaining({ publishedAt: expect.any(Date) }));
  });

  it('submits enquiry', async () => {
    const r = await service.submitEnquiry('t1', { fullName: 'John', email: 'j@t.com' } as any);
    expect(r.fullName).toBe('John');
  });

  it('throws 404 for non-existent page', async () => {
    mockRepo.getPageBySlug.mockResolvedValue(null);
    await expect(service.getPageBySlug('t1', 'missing')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

