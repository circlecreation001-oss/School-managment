import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { PrismaClient };
export type { Prisma } from '@prisma/client';
export {
  EntityStatus,
  TenantStatus,
  Gender,
  AttendanceStatus,
  LeaveStatus,
  PaymentStatus,
  PaymentMethod,
  InvoiceStatus,
  ExamStatus,
  ResultStatus,
  HomeworkStatus,
  SubmissionStatus,
  NotificationChannel,
  NotificationStatus,
  BookIssueStatus,
  AdmissionStatus,
  StudentStatus,
  TeacherStatus,
} from '@prisma/client';
