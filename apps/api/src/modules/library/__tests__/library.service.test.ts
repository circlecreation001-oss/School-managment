import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LibraryService } from '../library.service.js';

vi.mock('@erp/database', () => ({ prisma: { auditLog: { create: vi.fn() } } }));
vi.mock('../../config/index.js', () => ({ logger: { info: vi.fn() } }));

// Inline mock inside vi.mock factory below`nconst mockRepo = {
  listBooks: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getBook: vi.fn(),
  createBook: vi.fn().mockResolvedValue({ id: 'b1', title: 'Test Book', availableCopies: 3 }),
  updateBook: vi.fn().mockResolvedValue({ id: 'b1' }),
  deleteBook: vi.fn(),
  decrementAvailable: vi.fn(),
  incrementAvailable: vi.fn(),
  listIssues: vi.fn().mockResolvedValue({ data: [], total: 0 }),
  getIssue: vi.fn(),
  createIssue: vi.fn().mockResolvedValue({ id: 'i1' }),
  returnIssue: vi.fn(),
  collectFine: vi.fn(),
  getInventoryStats: vi.fn().mockResolvedValue({ totalBooks: 100, issuedCount: 20, overdueCount: 3 }),
  getOverdueIssues: vi.fn().mockResolvedValue([]),
  getMostIssuedBooks: vi.fn().mockResolvedValue([]),
  findByBarcode: vi.fn(),
};
vi.mock('../library.repository.js', () => ({ libraryRepository: mockRepo }));

describe('LibraryService', () => {
  let service: LibraryService;
  beforeEach(() => { service = new LibraryService(); vi.clearAllMocks(); });

  it('creates a book', async () => {
    const r = await service.createBook('t1', { title: 'Test', totalCopies: 3, language: 'English' } as any, 'actor');
    expect(r.title).toBe('Test Book');
  });

  it('issues a book and decrements available', async () => {
    mockRepo.getBook.mockResolvedValue({ id: 'b1', tenantId: 't1', deletedAt: null, availableCopies: 3 });
    await service.issueBook('t1', { bookId: 'b1', studentId: 's1', dueDate: '2025-08-01' }, 'actor');
    expect(mockRepo.decrementAvailable).toHaveBeenCalledWith('b1');
  });

  it('rejects issue when no copies available', async () => {
    mockRepo.getBook.mockResolvedValue({ id: 'b1', tenantId: 't1', deletedAt: null, availableCopies: 0 });
    await expect(service.issueBook('t1', { bookId: 'b1', studentId: 's1', dueDate: '2025-08-01' }, 'actor')).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('returns book and calculates overdue fine', async () => {
    const pastDue = new Date(); pastDue.setDate(pastDue.getDate() - 5);
    mockRepo.getIssue.mockResolvedValue({ id: 'i1', tenantId: 't1', bookId: 'b1', status: 'issued', dueDate: pastDue });
    const r = await service.returnBook('t1', { issueId: 'i1', condition: 'good' }, 'actor');
    expect(r.fine).toBeGreaterThan(0);
  });
});

