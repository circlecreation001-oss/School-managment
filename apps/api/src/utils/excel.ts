import ExcelJS from 'exceljs';

export async function generateStudentExcel(students: any[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Students');

  ws.columns = [
    { header: 'Admission No', key: 'admissionNumber', width: 15 },
    { header: 'First Name', key: 'firstName', width: 15 },
    { header: 'Last Name', key: 'lastName', width: 15 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Gender', key: 'gender', width: 10 },
    { header: 'Class', key: 'className', width: 12 },
    { header: 'Section', key: 'sectionName', width: 10 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Admission Date', key: 'admissionDate', width: 15 },
  ];

  // Style header
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  for (const s of students) {
    ws.addRow({
      admissionNumber: s.admissionNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email || '',
      phone: s.phone || '',
      gender: s.gender || '',
      className: s.class?.name || '',
      sectionName: s.section?.name || '',
      status: s.status,
      admissionDate: s.admissionDate ? new Date(s.admissionDate).toLocaleDateString() : '',
    });
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function generateAttendanceExcel(records: any[], dateRange: string): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Attendance');

  ws.columns = [
    { header: 'Student Name', key: 'name', width: 25 },
    { header: 'Date', key: 'date', width: 12 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Remarks', key: 'remarks', width: 30 },
  ];

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  for (const r of records) {
    ws.addRow({
      name: r.student ? `${r.student.firstName} ${r.student.lastName}` : '—',
      date: new Date(r.attendanceDate).toLocaleDateString(),
      status: r.status,
      remarks: r.remarks || '',
    });
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function generateFeeExcel(invoices: any[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Fee Report');

  ws.columns = [
    { header: 'Invoice #', key: 'invoiceNumber', width: 15 },
    { header: 'Student', key: 'student', width: 25 },
    { header: 'Total Amount', key: 'totalAmount', width: 15 },
    { header: 'Paid Amount', key: 'paidAmount', width: 15 },
    { header: 'Outstanding', key: 'outstanding', width: 15 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Due Date', key: 'dueDate', width: 12 },
  ];

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  for (const inv of invoices) {
    ws.addRow({
      invoiceNumber: inv.invoiceNumber,
      student: inv.student ? `${inv.student.firstName} ${inv.student.lastName}` : '—',
      totalAmount: Number(inv.totalAmount),
      paidAmount: Number(inv.paidAmount),
      outstanding: Number(inv.outstandingAmount),
      status: inv.status,
      dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '',
    });
  }

  // Add total row
  const totalRow = ws.addRow({ invoiceNumber: 'TOTAL', totalAmount: invoices.reduce((s: number, i: any) => s + Number(i.totalAmount), 0), paidAmount: invoices.reduce((s: number, i: any) => s + Number(i.paidAmount), 0), outstanding: invoices.reduce((s: number, i: any) => s + Number(i.outstandingAmount), 0) });
  totalRow.font = { bold: true };

  return Buffer.from(await wb.xlsx.writeBuffer());
}

export async function generateReportExcel(data: { title: string; headers: string[]; rows: any[][] }): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(data.title);

  ws.addRow(data.headers);
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };

  for (const row of data.rows) {
    ws.addRow(row);
  }

  // Auto-width
  ws.columns.forEach((col, i) => { col.width = Math.max(12, (data.headers[i]?.length || 10) + 5); });

  return Buffer.from(await wb.xlsx.writeBuffer());
}
