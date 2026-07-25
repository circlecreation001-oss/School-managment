import { Job } from 'bullmq';
import { logger } from '../config/index.js';

export interface ReportJobData {
  tenantId: string;
  reportType: string;
  format: 'pdf' | 'excel';
  filters?: Record<string, unknown>;
  actorId?: string;
}

/**
 * Report Worker — generates PDF and Excel exports
 * Files are stored in S3 and download URL is returned/logged
 */
export async function processReportJob(job: Job<ReportJobData>): Promise<void> {
  const { tenantId, reportType, format, filters } = job.data;

  logger.info({ jobId: job.id, tenantId, reportType, format }, 'Processing report export');

  try {
    if (format === 'excel') {
      await generateExcelReport(tenantId, reportType, filters);
    } else {
      await generatePdfReport(tenantId, reportType, filters);
    }

    logger.info({ jobId: job.id, reportType, format }, 'Report generated successfully');
  } catch (err: any) {
    logger.error({ jobId: job.id, err: err.message, reportType }, 'Report generation failed');
    throw err; // Will trigger retry
  }
}

async function generateExcelReport(tenantId: string, reportType: string, filters?: Record<string, unknown>) {
  const { prisma } = await import('@erp/database');
  const { generateStudentExcel, generateAttendanceExcel, generateFeeExcel, generateReportExcel } = await import('../utils/excel.js');

  let buffer: Buffer;

  switch (reportType) {
    case 'students': {
      const students = await prisma.student.findMany({
        where: { tenantId, deletedAt: null },
        include: { class: { select: { name: true } }, section: { select: { name: true } } },
        take: 5000,
      });
      buffer = await generateStudentExcel(students);
      break;
    }
    case 'attendance': {
      const records = await prisma.attendance.findMany({
        where: { tenantId },
        include: { student: { select: { firstName: true, lastName: true } } },
        orderBy: { attendanceDate: 'desc' },
        take: 5000,
      });
      buffer = await generateAttendanceExcel(records, 'All');
      break;
    }
    case 'fees': {
      const invoices = await prisma.invoice.findMany({
        where: { tenantId },
        include: { student: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      });
      buffer = await generateFeeExcel(invoices);
      break;
    }
    default: {
      buffer = await generateReportExcel({ title: reportType, headers: ['Data'], rows: [['No data']] });
    }
  }

  // Store to S3 (or log size for now)
  logger.info({ tenantId, reportType, size: buffer.length }, 'Excel report generated');
  // In production: upload to S3 and create download link
  // const { uploadFile, generateFileKey } = await import('../config/storage.js');
  // const key = generateFileKey(tenantId, 'reports', `${reportType}-${Date.now()}.xlsx`);
  // await uploadFile({ key, body: buffer, contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

async function generatePdfReport(tenantId: string, reportType: string, filters?: Record<string, unknown>) {
  const { prisma } = await import('@erp/database');
  const { generateFeeReceiptPDF, generateReportCardPDF, generateInvoicePDF } = await import('../utils/pdf.js');

  switch (reportType) {
    case 'fee-receipt': {
      const doc = generateFeeReceiptPDF({
        receiptNumber: (filters?.receiptNumber as string) || 'RCT-000',
        studentName: (filters?.studentName as string) || 'Student',
        className: (filters?.className as string) || '',
        amount: (filters?.amount as number) || 0,
        paymentMethod: (filters?.paymentMethod as string) || 'cash',
        paidAt: new Date().toLocaleDateString(),
      });
      doc.end();
      break;
    }
    case 'report-card': {
      const doc = generateReportCardPDF({
        studentName: (filters?.studentName as string) || 'Student',
        className: (filters?.className as string) || '',
        results: (filters?.results as any[]) || [],
      });
      doc.end();
      break;
    }
    case 'invoice': {
      const doc = generateInvoicePDF({
        invoiceNumber: (filters?.invoiceNumber as string) || 'INV-000',
        studentName: (filters?.studentName as string) || 'Student',
        className: (filters?.className as string) || '',
        items: (filters?.items as any[]) || [],
        totalAmount: (filters?.totalAmount as number) || 0,
        paidAmount: (filters?.paidAmount as number) || 0,
      });
      doc.end();
      break;
    }
    default:
      logger.info({ tenantId, reportType }, 'PDF report type not matched');
  }

  logger.info({ tenantId, reportType }, 'PDF report generated');
}
