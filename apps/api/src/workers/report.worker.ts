import { Job } from 'bullmq';
import { logger } from '../config/index.js';
import { uploadFile, generateFileKey } from '../config/storage.js';

export interface ReportJobData {
  tenantId: string;
  reportType: string;
  format: 'pdf' | 'excel' | 'csv';
  filters?: Record<string, unknown>;
  requestedBy: string;
}

/**
 * Report Worker Processor
 * Generates PDF/Excel/CSV reports and uploads to S3
 */
export async function processReportJob(job: Job<ReportJobData>): Promise<void> {
  const { tenantId, reportType, format, filters, requestedBy } = job.data;

  logger.info({ jobId: job.id, tenantId, reportType, format }, 'Generating report');

  try {
    let buffer: Buffer;
    let contentType: string;
    let fileName: string;

    switch (format) {
      case 'csv':
        buffer = await generateCsvReport(tenantId, reportType, filters);
        contentType = 'text/csv';
        fileName = `${reportType}-${Date.now()}.csv`;
        break;
      case 'excel':
        buffer = await generateExcelReport(tenantId, reportType, filters);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `${reportType}-${Date.now()}.xlsx`;
        break;
      case 'pdf':
      default:
        buffer = await generatePdfReport(tenantId, reportType, filters);
        contentType = 'application/pdf';
        fileName = `${reportType}-${Date.now()}.pdf`;
        break;
    }

    // Upload to S3
    const key = generateFileKey(tenantId, 'reports', fileName);
    const result = await uploadFile({ key, body: buffer, contentType });

    logger.info(
      { jobId: job.id, tenantId, reportType, format, fileKey: result.key },
      'Report generated and uploaded',
    );

    // Notify requester that report is ready
    const { prisma } = await import('@erp/database');
    await prisma.notification.create({
      data: {
        tenantId,
        recipientId: requestedBy,
        channel: 'in_app',
        subject: 'Report Ready',
        body: `Your ${reportType} report (${format.toUpperCase()}) is ready for download.`,
        data: { fileKey: result.key, url: result.url },
        status: 'delivered',
        sentAt: new Date(),
      },
    });
  } catch (err) {
    logger.error({ jobId: job.id, err, tenantId, reportType }, 'Report generation failed');
    throw err; // Let BullMQ retry
  }
}

async function generateCsvReport(
  tenantId: string,
  reportType: string,
  filters?: Record<string, unknown>,
): Promise<Buffer> {
  const { prisma } = await import('@erp/database');
  let rows: string[][] = [];
  let headers: string[] = [];

  switch (reportType) {
    case 'students': {
      headers = ['Admission No', 'First Name', 'Last Name', 'Class', 'Section', 'Status', 'Phone'];
      const students = await prisma.student.findMany({
        where: { tenantId, deletedAt: null },
        include: { class: { select: { name: true } }, section: { select: { name: true } } },
        take: 5000,
      });
      rows = students.map((s) => [
        s.admissionNumber, s.firstName, s.lastName,
        s.class?.name || '', s.section?.name || '', s.status, s.phone || '',
      ]);
      break;
    }
    case 'teachers': {
      headers = ['Emp Code', 'First Name', 'Last Name', 'Designation', 'Phone', 'Status'];
      const teachers = await prisma.teacher.findMany({
        where: { tenantId, deletedAt: null },
        take: 5000,
      });
      rows = teachers.map((t) => [
        t.employeeCode, t.firstName, t.lastName, t.designation || '', t.phone || '', t.status,
      ]);
      break;
    }
    case 'fees': {
      headers = ['Invoice No', 'Student', 'Total', 'Paid', 'Outstanding', 'Status', 'Due Date'];
      const invoices = await prisma.invoice.findMany({
        where: { tenantId, deletedAt: null },
        include: { student: { select: { firstName: true, lastName: true } } },
        take: 5000,
      });
      rows = invoices.map((i) => [
        i.invoiceNumber, `${i.student.firstName} ${i.student.lastName}`,
        i.totalAmount.toString(), i.paidAmount.toString(),
        i.outstandingAmount.toString(), i.status, i.dueDate?.toISOString().split('T')[0] || '',
      ]);
      break;
    }
    default:
      headers = ['Info'];
      rows = [['No data available for this report type']];
  }

  const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
  return Buffer.from(csv, 'utf-8');
}

async function generateExcelReport(
  tenantId: string,
  reportType: string,
  filters?: Record<string, unknown>,
): Promise<Buffer> {
  // Generate CSV as base (Excel can open CSV)
  // For proper .xlsx, install exceljs in production
  const csvBuffer = await generateCsvReport(tenantId, reportType, filters);
  return csvBuffer; // Returns CSV in xlsx content-type for now
}

async function generatePdfReport(
  tenantId: string,
  reportType: string,
  filters?: Record<string, unknown>,
): Promise<Buffer> {
  // Simple PDF generation using text (for production, use pdfkit or puppeteer)
  const { prisma } = await import('@erp/database');
  let title = reportType.charAt(0).toUpperCase() + reportType.slice(1) + ' Report';
  let content = `Generated: ${new Date().toISOString()}\n\n`;

  switch (reportType) {
    case 'students': {
      const count = await prisma.student.count({ where: { tenantId, deletedAt: null } });
      content += `Total Students: ${count}\n`;
      break;
    }
    case 'fees': {
      const stats = await prisma.invoice.aggregate({
        where: { tenantId, deletedAt: null },
        _sum: { totalAmount: true, paidAmount: true, outstandingAmount: true },
        _count: true,
      });
      content += `Total Invoices: ${stats._count}\n`;
      content += `Total Amount: ${stats._sum.totalAmount || 0}\n`;
      content += `Paid: ${stats._sum.paidAmount || 0}\n`;
      content += `Outstanding: ${stats._sum.outstandingAmount || 0}\n`;
      break;
    }
    default:
      content += 'Report data not available.\n';
  }

  // Minimal PDF structure
  const pdf = buildMinimalPdf(title, content);
  return Buffer.from(pdf);
}

function buildMinimalPdf(title: string, content: string): string {
  // Minimal valid PDF (for production use pdfkit)
  const lines = content.split('\n');
  const textContent = lines.map((l, i) => `BT /F1 10 Tf 50 ${700 - i * 14} Td (${l}) Tj ET`).join('\n');
  const titleLine = `BT /F1 16 Tf 50 750 Td (${title}) Tj ET`;

  const stream = `${titleLine}\n${textContent}`;
  const streamLength = stream.length;

  return `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length ${streamLength} >> stream
${stream}
endstream endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
trailer << /Size 6 /Root 1 0 R >>
startxref
0
%%EOF`;
}
