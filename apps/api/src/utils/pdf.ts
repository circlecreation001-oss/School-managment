import PDFDocument from 'pdfkit';

interface PDFOptions {
  title: string;
  subtitle?: string;
  instituteName?: string;
}

export function createPDFDoc(options: PDFOptions): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Header
  doc.fontSize(18).font('Helvetica-Bold').text(options.instituteName || 'Education ERP', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).font('Helvetica-Bold').text(options.title, { align: 'center' });
  if (options.subtitle) {
    doc.fontSize(10).font('Helvetica').text(options.subtitle, { align: 'center' });
  }
  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);

  return doc;
}

export function addTableRow(doc: PDFKit.PDFDocument, cols: string[], widths: number[], bold = false) {
  const y = doc.y;
  let x = 50;
  doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
  cols.forEach((col, i) => {
    doc.text(col, x, y, { width: widths[i], align: i === 0 ? 'left' : 'center' });
    x += widths[i]!;
  });
  doc.moveDown(0.8);
}

export function generateFeeReceiptPDF(data: {
  receiptNumber: string; studentName: string; className: string;
  amount: number; paymentMethod: string; paidAt: string; instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Fee Receipt', subtitle: `Receipt No: ${data.receiptNumber}`, instituteName: data.instituteName });

  doc.fontSize(11).font('Helvetica');
  doc.text(`Student: ${data.studentName}`);
  doc.text(`Class: ${data.className}`);
  doc.text(`Amount: ₹${data.amount.toLocaleString()}`);
  doc.text(`Payment Method: ${data.paymentMethod}`);
  doc.text(`Date: ${data.paidAt}`);
  doc.moveDown(2);
  doc.fontSize(9).text('This is a computer-generated receipt.', { align: 'center' });

  return doc;
}

export function generateReportCardPDF(data: {
  studentName: string; className: string; rollNumber?: string;
  results: Array<{ subject: string; marks: number; total: number; grade: string }>;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Report Card', subtitle: `${data.studentName} - ${data.className}`, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  if (data.rollNumber) doc.text(`Roll Number: ${data.rollNumber}`);
  doc.moveDown(1);

  const widths = [150, 80, 80, 80];
  addTableRow(doc, ['Subject', 'Marks', 'Total', 'Grade'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  for (const r of data.results) {
    addTableRow(doc, [r.subject, String(r.marks), String(r.total), r.grade], widths);
  }

  const totalMarks = data.results.reduce((s, r) => s + r.marks, 0);
  const totalMax = data.results.reduce((s, r) => s + r.total, 0);
  const percentage = totalMax > 0 ? ((totalMarks / totalMax) * 100).toFixed(1) : '0';

  doc.moveDown(1);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Total: ${totalMarks}/${totalMax} (${percentage}%)`);

  return doc;
}

export function generateCertificatePDF(data: {
  studentName: string; certificateType: string; certificateNo: string;
  issueDate: string; content: string; instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Certificate', subtitle: data.certificateType, instituteName: data.instituteName });

  doc.moveDown(2);
  doc.fontSize(12).font('Helvetica').text('This is to certify that', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16).font('Helvetica-Bold').text(data.studentName, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').text(data.content, { align: 'center' });
  doc.moveDown(2);
  doc.fontSize(9).text(`Certificate No: ${data.certificateNo}`, { align: 'left' });
  doc.text(`Issue Date: ${data.issueDate}`, { align: 'left' });

  return doc;
}

export function generateInvoicePDF(data: {
  invoiceNumber: string; studentName: string; className: string;
  items: Array<{ description: string; amount: number }>;
  totalAmount: number; paidAmount: number; dueDate?: string; instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Invoice', subtitle: `#${data.invoiceNumber}`, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  doc.text(`Student: ${data.studentName}`);
  doc.text(`Class: ${data.className}`);
  if (data.dueDate) doc.text(`Due Date: ${data.dueDate}`);
  doc.moveDown(1);

  const widths = [300, 100];
  addTableRow(doc, ['Description', 'Amount (₹)'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  for (const item of data.items) {
    addTableRow(doc, [item.description, item.amount.toLocaleString()], widths);
  }

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text(`Total: ₹${data.totalAmount.toLocaleString()}`, { align: 'right' });
  doc.text(`Paid: ₹${data.paidAmount.toLocaleString()}`, { align: 'right' });
  doc.text(`Outstanding: ₹${(data.totalAmount - data.paidAmount).toLocaleString()}`, { align: 'right' });

  return doc;
}
