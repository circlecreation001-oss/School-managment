import PDFDocument from 'pdfkit';

interface PDFOptions {
  title: string;
  subtitle?: string;
  instituteName?: string;
  logoUrl?: string;
}

export function createPDFDoc(options: PDFOptions): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  // Add page number footer
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).font('Helvetica').text(
      `Page ${i + 1}`,
      50,
      doc.page.height - 40,
      { align: 'center', width: doc.page.width - 100 }
    );
  }

  // Switch back to first page
  doc.switchToPage(0);

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
    const w = widths[i] || 100;
    doc.text(col || '', x, y, { width: w - 5, align: i === 0 ? 'left' : 'center' });
    x += w;
  });
  doc.moveDown(0.6);

  // Check bottom margin
  if (doc.y > doc.page.height - 100) {
    doc.addPage();
  }
}

export function generateFeeReceiptPDF(data: {
  receiptNumber: string;
  studentName: string;
  admissionNumber?: string;
  className?: string;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Fee Receipt', subtitle: `Receipt No: ${data.receiptNumber}`, instituteName: data.instituteName });

  doc.fontSize(11).font('Helvetica');
  doc.text(`Student Name: ${data.studentName}`);
  if (data.admissionNumber) doc.text(`Admission No: ${data.admissionNumber}`);
  if (data.className) doc.text(`Class: ${data.className}`);
  doc.text(`Amount Paid: ₹${data.amount.toLocaleString('en-IN')}`);
  doc.text(`Payment Method: ${data.paymentMethod}`);
  doc.text(`Payment Date: ${data.paidAt}`);
  doc.moveDown(2);
  doc.fontSize(9).text('This is a computer-generated receipt.', { align: 'center' });

  return doc;
}

export function generateReportCardPDF(data: {
  studentName: string;
  admissionNumber?: string;
  className?: string;
  rollNumber?: string;
  session?: string;
  results: Array<{ subject: string; marks: number; total: number; grade: string; percentage?: number }>;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Report Card', subtitle: `${data.studentName}${data.className ? ` - ${data.className}` : ''}`, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  if (data.admissionNumber) doc.text(`Admission No: ${data.admissionNumber}`);
  if (data.rollNumber) doc.text(`Roll Number: ${data.rollNumber}`);
  if (data.session) doc.text(`Academic Session: ${data.session}`);
  doc.moveDown(1);

  const widths = [160, 80, 80, 80];
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
  doc.fontSize(11).font('Helvetica-Bold').text(`Total: ${totalMarks}/${totalMax}  |  Percentage: ${percentage}%`);
  doc.moveDown(0.5);
  doc.fontSize(9).text(`Result: ${percentage >= '33' ? 'PASS' : 'FAIL'}`, { align: 'left' });

  return doc;
}

export function generateCertificatePDF(data: {
  studentName: string;
  certificateType: string;
  certificateNo: string;
  issueDate: string;
  content: string;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Certificate', subtitle: data.certificateType, instituteName: data.instituteName });

  doc.moveDown(3);
  doc.fontSize(14).font('Helvetica').text('This is to certify that', { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(18).font('Helvetica-Bold').text(data.studentName, { align: 'center' });
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica').text(data.content, { align: 'center', width: 400 });
  doc.moveDown(3);

  doc.fontSize(9).font('Helvetica');
  doc.text(`Certificate No: ${data.certificateNo}`, { align: 'left' });
  doc.text(`Issue Date: ${data.issueDate}`, { align: 'left' });
  doc.text(`This certificate is issued on the basis of records available.`, { align: 'left' });

  return doc;
}

export function generateInvoicePDF(data: {
  invoiceNumber: string;
  studentName: string;
  admissionNumber?: string;
  className?: string;
  items: Array<{ description: string; amount: number }>;
  totalAmount: number;
  paidAmount: number;
  dueDate?: string;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Fee Invoice', subtitle: `#${data.invoiceNumber}`, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  doc.text(`Student: ${data.studentName}`);
  if (data.admissionNumber) doc.text(`Admission No: ${data.admissionNumber}`);
  if (data.className) doc.text(`Class: ${data.className}`);
  if (data.dueDate) doc.text(`Due Date: ${data.dueDate}`);
  doc.moveDown(1);

  const widths = [300, 100];
  addTableRow(doc, ['Description', 'Amount (₹)'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  for (const item of data.items) {
    addTableRow(doc, [item.description, item.amount.toLocaleString('en-IN')], widths);
  }

  doc.moveDown(0.5);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold');
  doc.text(`Total: ₹${data.totalAmount.toLocaleString('en-IN')}`, { align: 'right' });
  doc.text(`Paid: ₹${data.paidAmount.toLocaleString('en-IN')}`, { align: 'right' });
  doc.text(`Outstanding: ₹${(data.totalAmount - data.paidAmount).toLocaleString('en-IN')}`, { align: 'right' });

  return doc;
}

export function generateAttendanceReportPDF(data: {
  studentName: string;
  admissionNumber?: string;
  className?: string;
  month: string;
  records: Array<{ date: string; status: string; remarks?: string }>;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Attendance Report', subtitle: `${data.studentName} - ${data.month}`, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  if (data.admissionNumber) doc.text(`Admission No: ${data.admissionNumber}`);
  if (data.className) doc.text(`Class: ${data.className}`);
  doc.text(`Month: ${data.month}`);
  doc.moveDown(1);

  const present = data.records.filter(r => r.status === 'present').length;
  const absent = data.records.filter(r => r.status === 'absent').length;
  const late = data.records.filter(r => r.status === 'late').length;
  const total = data.records.length;
  const pct = total > 0 ? ((present / total) * 100).toFixed(1) : '0';

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`Present: ${present}  |  Absent: ${absent}  |  Late: ${late}  |  Total: ${total}  |  Attendance: ${pct}%`);
  doc.moveDown(1);

  const widths = [100, 100, 100, 200];
  addTableRow(doc, ['Date', 'Day', 'Status', 'Remarks'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  for (const r of data.records) {
    const d = new Date(r.date);
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    addTableRow(doc, [
      d.toLocaleDateString(),
      day,
      r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' '),
      r.remarks || '-'
    ], widths);
  }

  return doc;
}

export function generateFeeLedgerPDF(data: {
  studentName: string;
  admissionNumber?: string;
  className?: string;
  transactions: Array<{ date: string; description: string; debit: number; credit: number; balance: number }>;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Fee Ledger', subtitle: data.studentName, instituteName: data.instituteName });

  doc.fontSize(10).font('Helvetica');
  if (data.admissionNumber) doc.text(`Admission No: ${data.admissionNumber}`);
  if (data.className) doc.text(`Class: ${data.className}`);
  doc.moveDown(1);

  const widths = [100, 150, 80, 80, 80];
  addTableRow(doc, ['Date', 'Description', 'Debit (₹)', 'Credit (₹)', 'Balance (₹)'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  for (const t of data.transactions) {
    addTableRow(doc, [
      new Date(t.date).toLocaleDateString(),
      t.description,
      t.debit > 0 ? t.debit.toLocaleString('en-IN') : '-',
      t.credit > 0 ? t.credit.toLocaleString('en-IN') : '-',
      t.balance.toLocaleString('en-IN')
    ], widths);
  }

  return doc;
}

export function generateExamResultSheetPDF(data: {
  examName: string;
  className?: string;
  subjectName?: string;
  results: Array<{ studentName: string; rollNumber?: string; marks: number; total: number; grade: string; percentage?: number }>;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = createPDFDoc({ title: 'Exam Result Sheet', subtitle: `${data.examName}${data.className ? ` - ${data.className}` : ''}`, instituteName: data.instituteName });

  const widths = [50, 180, 80, 80, 80];
  addTableRow(doc, ['S.No', 'Student Name', 'Marks', 'Total', 'Grade'], widths, true);
  doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
  doc.moveDown(0.3);

  data.results.forEach((r, i) => {
    addTableRow(doc, [
      String(i + 1),
      r.studentName,
      String(r.marks),
      String(r.total),
      r.grade
    ], widths);
  });

  const avg = data.results.length > 0
    ? (data.results.reduce((s, r) => s + r.marks, 0) / data.results.length).toFixed(1)
    : '0';
  const pass = data.results.filter(r => r.percentage != null && r.percentage >= 33).length;

  doc.moveDown(1);
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text(`Total Students: ${data.results.length}  |  Passed: ${pass}  |  Average: ${avg}`);

  return doc;
}

export function generateStudentIdCardPDF(data: {
  studentName: string;
  admissionNumber: string;
  className?: string;
  rollNumber?: string;
  dob?: string;
  bloodGroup?: string;
  phone?: string;
  address?: string;
  photoUrl?: string;
  instituteName?: string;
}): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: [242, 153], margin: 10 }); // ID card size

  // Header
  doc.fontSize(10).font('Helvetica-Bold').text(data.instituteName || 'SchoolNex', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(8).font('Helvetica').text('Student ID Card', { align: 'center' });
  doc.moveTo(10, doc.y).lineTo(232, doc.y).stroke();
  doc.moveDown(0.3);

  // Student Info
  doc.fontSize(9).font('Helvetica-Bold').text(data.studentName, { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(7).font('Helvetica');
  if (data.className) doc.text(`Class: ${data.className}`, 20);
  if (data.rollNumber) doc.text(`Roll No: ${data.rollNumber}`, 130);
  doc.text(`Admission No: ${data.admissionNumber}`, 20);
  if (data.bloodGroup) doc.text(`Blood Group: ${data.bloodGroup}`, 20);
  if (data.dob) doc.text(`DOB: ${data.dob}`, 130);
  if (data.phone) doc.text(`Phone: ${data.phone}`, 20);

  return doc;
}