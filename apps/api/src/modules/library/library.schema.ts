import { z } from 'zod';

// â”€â”€â”€ Book â”€â”€â”€
export const createBookSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  author: z.string().max(200).optional(),
  isbn: z.string().max(20).optional(),
  publisher: z.string().max(200).optional(),
  publicationYear: z.number().int().min(1800).max(2100).optional(),
  category: z.string().max(100).optional(),
  language: z.string().max(50).default('English'),
  barcode: z.string().max(50).optional(),
  shelfLocation: z.string().max(50).optional(),
  totalCopies: z.number().int().min(1).default(1),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
});
export const updateBookSchema = createBookSchema.partial();

// â”€â”€â”€ Issue â”€â”€â”€
export const issueBookSchema = z.object({
  bookId: z.string().min(1),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  staffId: z.string().optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// â”€â”€â”€ Return â”€â”€â”€
export const returnBookSchema = z.object({
  issueId: z.string().min(1),
  condition: z.enum(['good', 'damaged', 'lost']).default('good'),
  remarks: z.string().max(300).optional(),
});

// â”€â”€â”€ Fine â”€â”€â”€
export const collectFineSchema = z.object({
  issueId: z.string().min(1),
  amount: z.number().min(0),
  reason: z.string().max(200).optional(),
});

// â”€â”€â”€ Query â”€â”€â”€
export const bookListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().max(200).optional(),
  category: z.string().optional(),
  status: z.enum(['active', 'inactive', 'archived']).optional(),
  available: z.coerce.boolean().optional(),
});

export const issueListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['issued', 'returned', 'overdue', 'lost', 'damaged']).optional(),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  overdue: z.coerce.boolean().optional(),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type IssueBookInput = z.infer<typeof issueBookSchema>;
export type ReturnBookInput = z.infer<typeof returnBookSchema>;
export type CollectFineInput = z.infer<typeof collectFineSchema>;
export type BookListQuery = z.output<typeof bookListQuerySchema>;
export type IssueListQuery = z.output<typeof issueListQuerySchema>;
