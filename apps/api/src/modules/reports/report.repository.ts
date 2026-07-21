import { prisma } from '@erp/database';

export class ReportRepository {
  // â”€â”€â”€ Dashboard KPIs â”€â”€â”€
  async getDashboardKPIs(tenantId: string, branchId?: string) {
    const studentWhere = { tenantId, deletedAt: null, status: 'active' as const, ...(branchId ? { branchId } : {}) };
    const teacherWhere = { tenantId, deletedAt: null, status: 'active' as const, ...(branchId ? { branchId } : {}) };

    const [totalStudents, totalTeachers, totalStaff, totalInvoices, paidInvoices, pendingFees] = await Promise.all([
      prisma.student.count({ where: studentWhere }),
      prisma.teacher.count({ where: teacherWhere }),
      prisma.staff.count({ where: { tenantId, deletedAt: null } }),
      prisma.invoice.count({ where: { tenantId, deletedAt: null } }),
      prisma.invoice.count({ where: { tenantId, deletedAt: null, status: 'paid' } }),
      prisma.invoice.aggregate({ where: { tenantId, deletedAt: null, status: { in: ['issued', 'partially_paid', 'overdue'] } }, _sum: { outstandingAmount: true } }),
    ]);

    return {
      totalStudents, totalTeachers, totalStaff,
      totalInvoices, paidInvoices,
      pendingFeeAmount: Number(pendingFees._sum.outstandingAmount || 0),
      collectionRate: totalInvoices > 0 ? Math.round((paidInvoices / totalInvoices) * 100) : 0,
    };
  }

  // â”€â”€â”€ Attendance Report â”€â”€â”€
  async getAttendanceReport(tenantId: string, startDate: Date, endDate: Date, classId?: string, type = 'student') {
    const isStudent = type === 'student';
    const where: any = { tenantId, attendanceDate: { gte: startDate, lte: endDate } };
    if (isStudent) { where.studentId = { not: null }; if (classId) where.classId = classId; }
    else if (type === 'teacher') where.teacherId = { not: null };
    else where.staffId = { not: null };

    const records = await prisma.attendance.groupBy({
      by: ['status'], where, _count: { id: true },
    });

    const total = records.reduce((s, r) => s + r._count.id, 0);
    const breakdown: Record<string, number> = {};
    for (const r of records) breakdown[r.status] = r._count.id;

    return { total, breakdown, percentage: total > 0 ? Math.round(((breakdown['present'] || 0) / total) * 100) : 0 };
  }

  async getAttendanceTrend(tenantId: string, startDate: Date, endDate: Date, classId?: string) {
    const where: any = { tenantId, studentId: { not: null }, attendanceDate: { gte: startDate, lte: endDate } };
    if (classId) where.classId = classId;

    return prisma.attendance.groupBy({
      by: ['attendanceDate', 'status'], where, _count: { id: true }, orderBy: { attendanceDate: 'asc' },
    });
  }

  // â”€â”€â”€ Fee Report â”€â”€â”€
  async getFeeReport(tenantId: string, startDate: Date, endDate: Date, classId?: string, status?: string) {
    const where: any = { tenantId, deletedAt: null, createdAt: { gte: startDate, lte: endDate } };
    if (status) where.status = status as any;

    const [invoices, totals, payments] = await Promise.all([
      prisma.invoice.aggregate({ where, _sum: { totalAmount: true, paidAmount: true, outstandingAmount: true }, _count: { id: true } }),
      prisma.payment.aggregate({ where: { tenantId, status: 'completed', paidAt: { gte: startDate, lte: endDate } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.payment.groupBy({ by: ['paymentMethod'], where: { tenantId, status: 'completed', paidAt: { gte: startDate, lte: endDate } }, _sum: { amount: true } }),
    ]);

    return {
      invoiceCount: invoices._count.id,
      totalBilled: Number(invoices._sum.totalAmount || 0),
      totalCollected: Number(totals._sum.amount || 0),
      totalOutstanding: Number(invoices._sum.outstandingAmount || 0),
      paymentCount: totals._count.id,
      byMethod: payments.map((p) => ({ method: p.paymentMethod, amount: Number(p._sum.amount || 0) })),
    };
  }

  async getRevenueTrend(tenantId: string, year: number) {
    const payments = await prisma.payment.findMany({
      where: { tenantId, status: 'completed', paidAt: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) } },
      select: { amount: true, paidAt: true },
    });
    const monthly: Record<string, number> = {};
    for (const p of payments) {
      if (p.paidAt) {
        const key = `${p.paidAt.getFullYear()}-${String(p.paidAt.getMonth() + 1).padStart(2, '0')}`;
        monthly[key] = (monthly[key] || 0) + Number(p.amount);
      }
    }
    return Object.entries(monthly).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month));
  }

  // â”€â”€â”€ Student Report â”€â”€â”€
  async getStudentReport(tenantId: string, branchId: string, classId?: string, status?: string, gender?: string) {
    const where: any = { tenantId, branchId, deletedAt: null };
    if (classId) where.classId = classId;
    if (status) where.status = status as any;
    if (gender) where.gender = gender;

    const [total, byStatus, byGender, byClass] = await Promise.all([
      prisma.student.count({ where }),
      prisma.student.groupBy({ by: ['status'], where: { tenantId, branchId, deletedAt: null }, _count: { id: true } }),
      prisma.student.groupBy({ by: ['gender'], where: { tenantId, branchId, deletedAt: null, status: 'active' }, _count: { id: true } }),
      prisma.student.groupBy({ by: ['classId'], where: { tenantId, branchId, deletedAt: null, status: 'active' }, _count: { id: true } }),
    ]);

    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byGender: byGender.map((g) => ({ gender: g.gender || 'unknown', count: g._count.id })),
      byClass: byClass.map((c) => ({ classId: c.classId, count: c._count.id })),
    };
  }

  // â”€â”€â”€ Teacher Report â”€â”€â”€
  async getTeacherReport(tenantId: string, branchId: string) {
    const [total, byStatus, byDepartment] = await Promise.all([
      prisma.teacher.count({ where: { tenantId, branchId, deletedAt: null } }),
      prisma.teacher.groupBy({ by: ['status'], where: { tenantId, branchId, deletedAt: null }, _count: { id: true } }),
      prisma.teacher.groupBy({ by: ['departmentId'], where: { tenantId, branchId, deletedAt: null }, _count: { id: true } }),
    ]);
    return {
      total,
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      byDepartment: byDepartment.map((d) => ({ departmentId: d.departmentId, count: d._count.id })),
    };
  }

  // â”€â”€â”€ Exam Results Report â”€â”€â”€
  async getExamResultsReport(tenantId: string, sessionId: string, classId?: string) {
    const where: any = { tenantId, deletedAt: null, status: 'published', exam: { academicSessionId: sessionId } };
    if (classId) where.exam.classId = classId;

    const results = await prisma.result.findMany({
      where,
      include: { exam: { select: { name: true, totalMarks: true, subject: { select: { name: true } } } }, grade: { select: { name: true } } },
    });

    const totalStudents = new Set(results.map((r) => r.studentId)).size;
    const avgPercentage = results.length > 0
      ? results.reduce((sum, r) => sum + (Number(r.percentage) || 0), 0) / results.length
      : 0;

    return { totalResults: results.length, totalStudents, avgPercentage: Math.round(avgPercentage * 100) / 100 };
  }
}

export const reportRepository = new ReportRepository();
