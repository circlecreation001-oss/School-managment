import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class LibraryRepository {
  // ─── Books ───
  async listBooks(tenantId: string, params: {
    page: number; limit: number; search?: string; category?: string;
    status?: string; available?: boolean;
  }) {
    const where: Prisma.BookWhereInput = { tenantId, deletedAt: null };
    if (params.category) where.category = params.category;
    if (params.status) where.status = params.status as any;
    if (params.available === true) where.availableCopies = { gt: 0 };
    if (params.available === false) where.availableCopies = { lte: 0 };
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { author: { contains: params.search, mode: 'insensitive' } },
        { isbn: { contains: params.search, mode: 'insensitive' } },
        { barcode: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.book.findMany({
        where, skip: (params.page - 1) * params.limit, take: params.limit,
        orderBy: { title: 'asc' },
      }),
      prisma.book.count({ where }),
    ]);
    return { data, total };
  }

  async getBook(id: string) { return prisma.book.findUnique({ where: { id } }); }
  async createBook(data: Prisma.BookUncheckedCreateInput) { return prisma.book.create({ data }); }
  async updateBook(id: string, data: Prisma.BookUpdateInput) { return prisma.book.update({ where: { id }, data }); }
  async deleteBook(id: string) { return prisma.book.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } }); }

  async decrementAvailable(bookId: string) {
    return prisma.book.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } });
  }
  async incrementAvailable(bookId: string) {
    return prisma.book.update({ where: { id: bookId }, data: { availableCopies: { increment: 1 } } });
  }

  // ─── Issues ───
  async listIssues(tenantId: string, params: {
    page: number; limit: number; status?: string; studentId?: string;
    teacherId?: string; overdue?: boolean;
  }) {
    const where: Prisma.BookIssueWhereInput = { tenantId };
    if (params.status) where.status = params.status as any;
    if (params.studentId) where.studentId = params.studentId;
    if (params.teacherId) where.teacherId = params.teacherId;
    if (params.overdue) { where.status = 'issued'; where.dueDate = { lt: new Date() }; }

    const [data, total] = await Promise.all([
      prisma.bookIssue.findMany({
        where,
        include: {
          book: { select: { id: true, title: true, author: true, barcode: true } },
          student: { select: { id: true, firstName: true, lastName: true, admissionNumber: true } },
          teacher: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
        },
        skip: (params.page - 1) * params.limit, take: params.limit,
        orderBy: { issueDate: 'desc' },
      }),
      prisma.bookIssue.count({ where }),
    ]);
    return { data, total };
  }

  async getIssue(id: string) {
    return prisma.bookIssue.findUnique({
      where: { id },
      include: { book: true, student: { select: { firstName: true, lastName: true } }, teacher: { select: { firstName: true, lastName: true } } },
    });
  }

  async createIssue(data: Prisma.BookIssueUncheckedCreateInput) { return prisma.bookIssue.create({ data }); }

  async returnIssue(id: string, status: string, returnDate: Date) {
    return prisma.bookIssue.update({ where: { id }, data: { status: status as any, returnDate } });
  }

  async collectFine(id: string, amount: number, reason: string) {
    return prisma.bookIssue.update({ where: { id }, data: { fineAmount: amount, fineReason: reason, finePaid: true } });
  }

  // ─── Reports ───
  async getInventoryStats(tenantId: string) {
    const [totalBooks, totalCopies, issuedCount, overdueCount, categories] = await Promise.all([
      prisma.book.count({ where: { tenantId, deletedAt: null } }),
      prisma.book.aggregate({ where: { tenantId, deletedAt: null }, _sum: { totalCopies: true, availableCopies: true } }),
      prisma.bookIssue.count({ where: { tenantId, status: 'issued' } }),
      prisma.bookIssue.count({ where: { tenantId, status: 'issued', dueDate: { lt: new Date() } } }),
      prisma.book.groupBy({ by: ['category'], where: { tenantId, deletedAt: null }, _count: { id: true } }),
    ]);
    return {
      totalBooks,
      totalCopies: totalCopies._sum.totalCopies || 0,
      availableCopies: totalCopies._sum.availableCopies || 0,
      issuedCount,
      overdueCount,
      categories: categories.map((c) => ({ category: c.category || 'Uncategorized', count: c._count.id })),
    };
  }

  async getMostIssuedBooks(tenantId: string, limit = 10) {
    return prisma.bookIssue.groupBy({
      by: ['bookId'],
      where: { tenantId },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });
  }

  async getOverdueIssues(tenantId: string) {
    return prisma.bookIssue.findMany({
      where: { tenantId, status: 'issued', dueDate: { lt: new Date() } },
      include: {
        book: { select: { title: true, barcode: true } },
        student: { select: { firstName: true, lastName: true, admissionNumber: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  // ─── Barcode lookup ───
  async findByBarcode(tenantId: string, barcode: string) {
    return prisma.book.findFirst({ where: { tenantId, barcode, deletedAt: null } });
  }
}

export const libraryRepository = new LibraryRepository();
