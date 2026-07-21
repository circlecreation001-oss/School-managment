import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { libraryRepository } from './library.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type { CreateBookInput, UpdateBookInput, IssueBookInput, ReturnBookInput, CollectFineInput, BookListQuery, IssueListQuery } from './library.schema.js';

export class LibraryService {
  // â”€â”€â”€ BOOKS â”€â”€â”€
  async listBooks(tenantId: string, query: BookListQuery) {
    const { data, total } = await libraryRepository.listBooks(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  async getBook(tenantId: string, id: string) {
    const book = await libraryRepository.getBook(id);
    if (!book || book.tenantId !== tenantId || book.deletedAt) throw new AppError(404, 'NOT_FOUND', 'Book not found');
    return book;
  }

  async createBook(tenantId: string, input: CreateBookInput, actorId: string) {
    const book = await libraryRepository.createBook({
      tenantId, ...input, availableCopies: input.totalCopies,
    });
    await this.audit(tenantId, actorId, 'book', book.id, 'create');
    return book;
  }

  async updateBook(tenantId: string, id: string, input: UpdateBookInput, actorId: string) {
    await this.getBook(tenantId, id);
    const updated = await libraryRepository.updateBook(id, input);
    await this.audit(tenantId, actorId, 'book', id, 'update');
    return updated;
  }

  async deleteBook(tenantId: string, id: string, actorId: string) {
    await this.getBook(tenantId, id);
    await libraryRepository.deleteBook(id);
    await this.audit(tenantId, actorId, 'book', id, 'delete');
    return { message: 'Book archived' };
  }

  async findByBarcode(tenantId: string, barcode: string) {
    const book = await libraryRepository.findByBarcode(tenantId, barcode);
    if (!book) throw new AppError(404, 'NOT_FOUND', 'No book found with this barcode');
    return book;
  }

  // â”€â”€â”€ ISSUE â”€â”€â”€
  async issueBook(tenantId: string, input: IssueBookInput, actorId: string) {
    const book = await this.getBook(tenantId, input.bookId);
    if (book.availableCopies <= 0) throw new AppError(400, 'BAD_REQUEST', 'No copies available for issue');
    if (!input.studentId && !input.teacherId && !input.staffId) {
      throw new AppError(400, 'BAD_REQUEST', 'Specify a student, teacher, or staff to issue to');
    }

    const issue = await libraryRepository.createIssue({
      tenantId, bookId: input.bookId, studentId: input.studentId,
      teacherId: input.teacherId, staffId: input.staffId,
      issueDate: new Date(), dueDate: new Date(input.dueDate), status: 'issued',
    });

    await libraryRepository.decrementAvailable(input.bookId);
    await this.audit(tenantId, actorId, 'book_issue', issue.id, 'issue');
    logger.info({ tenantId, bookId: input.bookId, issueId: issue.id, actorId }, 'Book issued');
    return issue;
  }

  // â”€â”€â”€ RETURN â”€â”€â”€
  async returnBook(tenantId: string, input: ReturnBookInput, actorId: string) {
    const issue = await libraryRepository.getIssue(input.issueId);
    if (!issue || issue.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Issue record not found');
    if (issue.status !== 'issued') throw new AppError(400, 'BAD_REQUEST', 'Book is not currently issued');

    const status = input.condition === 'lost' ? 'lost' : input.condition === 'damaged' ? 'damaged' : 'returned';
    await libraryRepository.returnIssue(input.issueId, status, new Date());

    if (input.condition !== 'lost') {
      await libraryRepository.incrementAvailable(issue.bookId);
    }

    // Auto-calculate fine for overdue
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dueDate = new Date(issue.dueDate); dueDate.setHours(0, 0, 0, 0);
    let fine = 0;
    if (today > dueDate) {
      const overdueDays = Math.ceil((today.getTime() - dueDate.getTime()) / 86400000);
      fine = overdueDays * 2; // â‚¹2/day default fine
    }
    if (input.condition === 'lost') fine += 500; // Replacement charge
    if (input.condition === 'damaged') fine += 100; // Damage charge

    if (fine > 0) {
      await libraryRepository.collectFine(input.issueId, fine, input.condition === 'good' ? 'Overdue fine' : `${input.condition} charge`);
    }

    await this.audit(tenantId, actorId, 'book_issue', input.issueId, 'return', { condition: input.condition, fine });
    return { issueId: input.issueId, status, fine, condition: input.condition };
  }

  // â”€â”€â”€ FINE â”€â”€â”€
  async collectFine(tenantId: string, input: CollectFineInput, actorId: string) {
    const issue = await libraryRepository.getIssue(input.issueId);
    if (!issue || issue.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Issue not found');
    await libraryRepository.collectFine(input.issueId, input.amount, input.reason || 'Fine collected');
    await this.audit(tenantId, actorId, 'book_fine', input.issueId, 'collect', { amount: input.amount });
    return { message: 'Fine collected', amount: input.amount };
  }

  // â”€â”€â”€ ISSUES LIST â”€â”€â”€
  async listIssues(tenantId: string, query: IssueListQuery) {
    const { data, total } = await libraryRepository.listIssues(tenantId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  // â”€â”€â”€ REPORTS â”€â”€â”€
  async getInventoryStats(tenantId: string) { return libraryRepository.getInventoryStats(tenantId); }
  async getOverdueList(tenantId: string) { return libraryRepository.getOverdueIssues(tenantId); }
  async getMostIssued(tenantId: string) { return libraryRepository.getMostIssuedBooks(tenantId); }

  // â”€â”€â”€ PRIVATE â”€â”€â”€
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: (metadata as any) || undefined } });
  }
}

export const libraryService = new LibraryService();
