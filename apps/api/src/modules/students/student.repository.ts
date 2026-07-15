import { prisma } from '@erp/database';
import type { Prisma } from '@erp/database';

export class StudentRepository {
  async list(tenantId: string, branchId: string, params: {
    page?: number; limit?: number; search?: string; classId?: string;
    sectionId?: string; status?: string; gender?: string;
    sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) {
    const where: Prisma.StudentWhereInput = { tenantId, branchId, deletedAt: null };
    if (params.classId) where.classId = params.classId;
    if (params.sectionId) where.sectionId = params.sectionId;
    if (params.status) where.status = params.status as any;
    if (params.gender) where.gender = params.gender as any;
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { admissionNumber: { contains: params.search, mode: 'insensitive' } },
        { rollNumber: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: { select: { id: true, name: true, code: true } },
          section: { select: { id: true, name: true } },
          parentLinks: { include: { parent: { select: { firstName: true, lastName: true, phone: true, relation: true } } } },
        },
        skip: ((params.page || 1) - 1) * (params.limit || 20),
        take: params.limit || 20,
        orderBy: { [params.sortBy]: params.sortOrder },
      }),
      prisma.student.count({ where }),
    ]);
    return { data, total };
  }

  async findById(id: string) {
    return prisma.student.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
        batch: { select: { id: true, name: true } },
        parentLinks: { include: { parent: true } },
        documents: { where: { deletedAt: null } },
        certificates: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async findByAdmissionNumber(tenantId: string, admissionNumber: string) {
    return prisma.student.findUnique({ where: { tenantId_admissionNumber: { tenantId, admissionNumber } } });
  }

  async create(data: any /* Prisma.StudentUncheckedCreateInput */) {
    return prisma.student.create({ data, include: { class: { select: { name: true } }, section: { select: { name: true } } } });
  }

  async update(id: string, data: any /* Prisma.StudentUpdateInput */) {
    return prisma.student.update({ where: { id }, data });
  }

  async softDelete(id: string) {
    return prisma.student.update({ where: { id }, data: { deletedAt: new Date(), status: 'archived' } });
  }

  // â”€â”€â”€ Parents â”€â”€â”€
  async createParent(data: any /* Prisma.ParentUncheckedCreateInput */) {
    return prisma.parent.create({ data });
  }
  async linkParentToStudent(parentId: string, studentId: string, relation: string, isPrimary: boolean) {
    return prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId, studentId } },
      update: { relation, isPrimary },
      create: { parentId, studentId, relation, isPrimary },
    });
  }
  async getStudentParents(studentId: string) {
    return prisma.parentStudent.findMany({
      where: { studentId },
      include: { parent: true },
    });
  }
  async removeParentLink(parentId: string, studentId: string) {
    return prisma.parentStudent.deleteMany({ where: { parentId, studentId } });
  }

  // â”€â”€â”€ Documents â”€â”€â”€
  async addDocument(data: any /* Prisma.StudentDocumentUncheckedCreateInput */) {
    return prisma.studentDocument.create({ data });
  }
  async getDocuments(studentId: string) {
    return prisma.studentDocument.findMany({ where: { studentId, deletedAt: null }, orderBy: { createdAt: 'desc' } });
  }
  async deleteDocument(id: string) {
    return prisma.studentDocument.update({ where: { id }, data: { deletedAt: new Date() } });
  }
  async verifyDocument(id: string, verifiedBy: string) {
    return prisma.studentDocument.update({ where: { id }, data: { isVerified: true, verifiedBy, verifiedAt: new Date() } });
  }

  // â”€â”€â”€ Promotion â”€â”€â”€
  async promoteStudents(studentIds: string[], data: { classId: string; sectionId?: string; academicSessionId: string }) {
    return prisma.student.updateMany({
      where: { id: { in: studentIds } },
      data: { classId: data.classId, sectionId: data.sectionId || null, academicSessionId: data.academicSessionId, status: 'active' },
    });
  }

  // â”€â”€â”€ Transfer â”€â”€â”€
  async transferStudent(id: string) {
    return prisma.student.update({ where: { id }, data: { status: 'transferred' } });
  }

  // â”€â”€â”€ Certificates â”€â”€â”€
  async addCertificate(data: any /* Prisma.CertificateUncheckedCreateInput */) {
    return prisma.certificate.create({ data });
  }
  async getCertificates(studentId: string) {
    return prisma.certificate.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } });
  }

  // â”€â”€â”€ Stats â”€â”€â”€
  async countByClass(tenantId: string, branchId: string) {
    return prisma.student.groupBy({
      by: ['classId'],
      where: { tenantId, branchId, deletedAt: null, status: 'active' },
      _count: { id: true },
    });
  }

  // â”€â”€â”€ Bulk â”€â”€â”€
  async createMany(students: Prisma.StudentCreateManyInput[]) {
    return prisma.student.createMany({ data: students, skipDuplicates: true });
  }

  async exportStudents(tenantId: string, branchId: string, classId?: string) {
    const where: Prisma.StudentWhereInput = { tenantId, branchId, deletedAt: null };
    if (classId) where.classId = classId;
    return prisma.student.findMany({
      where,
      select: {
        admissionNumber: true, firstName: true, lastName: true, dob: true,
        gender: true, email: true, phone: true, rollNumber: true, status: true,
        address: true, city: true, state: true,
        class: { select: { name: true } }, section: { select: { name: true } },
      },
      orderBy: { admissionNumber: 'asc' },
    });
  }

  // â”€â”€â”€ Generate admission number â”€â”€â”€
  async getNextAdmissionNumber(tenantId: string): Promise<string> {
    const count = await prisma.student.count({ where: { tenantId } });
    const year = new Date().getFullYear().toString().slice(-2);
    return `ADM${year}${String(count + 1).padStart(5, '0')}`;
  }
}

export const studentRepository = new StudentRepository();
