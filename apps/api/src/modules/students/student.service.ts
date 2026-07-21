import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { studentRepository } from './student.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import type {
  CreateAdmissionInput, UpdateStudentInput, UpsertParentInput,
  UploadDocumentInput, PromoteStudentsInput, TransferStudentInput,
  BulkImportStudentsInput, StudentListQuery,
} from './student.schema.js';

export class StudentService {
  // ─── LIST ───
  async list(tenantId: string, branchId: string, query: StudentListQuery) {
    const { data, total } = await studentRepository.list(tenantId, branchId, query);
    const meta = buildPaginationMeta(total, query.page, query.limit);
    return { data, meta };
  }

  // ─── GET ───
  async getById(tenantId: string, id: string) {
    const student = await studentRepository.findById(id);
    if (!student || student.tenantId !== tenantId || student.deletedAt) {
      throw new AppError(404, 'NOT_FOUND', 'Student not found');
    }
    return student;
  }

  // ─── ADMIT ───
  async admit(tenantId: string, branchId: string, input: CreateAdmissionInput, actorId: string) {
    // BR-ST-019: Duplicate prevention by email and phone
    if (input.email) {
      const byEmail = await prisma.student.findFirst({ where: { tenantId, email: input.email, deletedAt: null } });
      if (byEmail) throw new AppError(409, 'CONFLICT', 'A student with this email already exists');
    }
    if (input.phone) {
      const byPhone = await prisma.student.findFirst({ where: { tenantId, phone: input.phone, deletedAt: null } });
      if (byPhone) throw new AppError(409, 'CONFLICT', 'A student with this phone number already exists');
    }

    const admissionNumber = await studentRepository.getNextAdmissionNumber(tenantId);

    const student = await studentRepository.create({
      tenantId,
      branchId,
      academicSessionId: input.academicSessionId,
      classId: input.classId,
      sectionId: input.sectionId,
      batchId: input.batchId,
      admissionNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName,
      dob: input.dob ? new Date(input.dob) : undefined,
      gender: input.gender as any,
      email: input.email,
      phone: input.phone,
      bloodGroup: input.bloodGroup,
      address: input.address,
      city: input.city,
      state: input.state,
      pincode: input.pincode,
      admissionDate: input.admissionDate ? new Date(input.admissionDate) : new Date(),
      status: 'active',
      createdBy: actorId,
    });

    // Create guardian if provided
    if (input.guardian) {
      const parent = await studentRepository.createParent({
        tenantId,
        firstName: input.guardian.firstName,
        lastName: input.guardian.lastName,
        relation: input.guardian.relation,
        phone: input.guardian.phone,
        email: input.guardian.email,
        occupation: input.guardian.occupation,
        address: input.guardian.address,
      });
      await studentRepository.linkParentToStudent(parent.id, student.id, input.guardian.relation, true);
    }

    await this.audit(tenantId, actorId, 'student', student.id, 'admit');
    logger.info({ tenantId, studentId: student.id, admissionNumber, actorId }, 'Student admitted');
    return student;
  }

  // ─── UPDATE ───
  async update(tenantId: string, id: string, input: UpdateStudentInput, actorId: string) {
    await this.getById(tenantId, id);
    const data: Record<string, unknown> = { updatedBy: actorId };
    Object.entries(input).forEach(([k, v]) => { if (v !== undefined) data[k] = v; });
    if (data.dob) data.dob = new Date(data.dob as string);
    const updated = await studentRepository.update(id, data);
    await this.audit(tenantId, actorId, 'student', id, 'update');
    return updated;
  }

  // ─── DELETE ───
  async archive(tenantId: string, id: string, actorId: string) {
    await this.getById(tenantId, id);
    await studentRepository.softDelete(id);
    await this.audit(tenantId, actorId, 'student', id, 'archive');
    return { message: 'Student archived' };
  }

  // ─── PARENTS ───
  async getParents(tenantId: string, studentId: string) {
    await this.getById(tenantId, studentId);
    return studentRepository.getStudentParents(studentId);
  }

  async addParent(tenantId: string, studentId: string, input: UpsertParentInput, actorId: string) {
    await this.getById(tenantId, studentId);
    const parent = await studentRepository.createParent({
      tenantId, firstName: input.firstName, lastName: input.lastName,
      relation: input.relation, phone: input.phone, email: input.email,
      occupation: input.occupation, address: input.address,
    });
    await studentRepository.linkParentToStudent(parent.id, studentId, input.relation, input.isPrimary);
    await this.audit(tenantId, actorId, 'parent', parent.id, 'create');
    return parent;
  }

  async removeParent(tenantId: string, studentId: string, parentId: string, actorId: string) {
    await this.getById(tenantId, studentId);
    await studentRepository.removeParentLink(parentId, studentId);
    await this.audit(tenantId, actorId, 'parent', parentId, 'remove');
    return { message: 'Parent removed' };
  }

  // ─── DOCUMENTS ───
  async getDocuments(tenantId: string, studentId: string) {
    await this.getById(tenantId, studentId);
    return studentRepository.getDocuments(studentId);
  }

  async addDocument(tenantId: string, studentId: string, input: UploadDocumentInput, actorId: string) {
    await this.getById(tenantId, studentId);
    const doc = await studentRepository.addDocument({ tenantId, studentId, ...input });
    await this.audit(tenantId, actorId, 'student_document', doc.id, 'upload');
    return doc;
  }

  async deleteDocument(tenantId: string, studentId: string, docId: string, actorId: string) {
    await this.getById(tenantId, studentId);
    await studentRepository.deleteDocument(docId);
    await this.audit(tenantId, actorId, 'student_document', docId, 'delete');
    return { message: 'Document removed' };
  }

  async verifyDocument(tenantId: string, studentId: string, docId: string, actorId: string) {
    await this.getById(tenantId, studentId);
    await studentRepository.verifyDocument(docId, actorId);
    await this.audit(tenantId, actorId, 'student_document', docId, 'verify');
    return { message: 'Document verified' };
  }

  // ─── PROMOTION ───
  async promote(tenantId: string, branchId: string, input: PromoteStudentsInput, actorId: string) {
    await studentRepository.promoteStudents(input.studentIds, {
      classId: input.toClassId, sectionId: input.toSectionId, academicSessionId: input.toAcademicSessionId,
    });
    await this.audit(tenantId, actorId, 'student', null, 'bulk_promote', { count: input.studentIds.length });
    logger.info({ tenantId, count: input.studentIds.length, actorId }, 'Students promoted');
    return { message: `${input.studentIds.length} students promoted` };
  }

  // ─── TRANSFER ───
  async transfer(tenantId: string, id: string, input: TransferStudentInput, actorId: string) {
    await this.getById(tenantId, id);
    await studentRepository.transferStudent(id);
    await this.audit(tenantId, actorId, 'student', id, 'transfer', input);
    return { message: 'Student transferred' };
  }

  // ─── CERTIFICATES ───
  async getCertificates(tenantId: string, studentId: string) {
    await this.getById(tenantId, studentId);
    return studentRepository.getCertificates(studentId);
  }

  // ─── TIMELINE / ACTIVITY ───
  async getTimeline(tenantId: string, studentId: string) {
    await this.getById(tenantId, studentId);
    return prisma.auditLog.findMany({
      where: { tenantId, entityId: studentId, entityType: 'student' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { id: true, action: true, createdAt: true, metadata: true, actor: { select: { firstName: true, lastName: true } } },
    });
  }

  // ─── BULK IMPORT ───
  async bulkImport(tenantId: string, branchId: string, input: BulkImportStudentsInput, sessionId: string, actorId: string) {
    let successful = 0, failed = 0;
    const errors: Array<{ row: number; message: string }> = [];

    for (let i = 0; i < input.students.length; i++) {
      const row = input.students[i]!;
      try {
        const admNo = await studentRepository.getNextAdmissionNumber(tenantId);
        await studentRepository.create({
          tenantId, branchId, academicSessionId: sessionId,
          classId: row.classId, sectionId: row.sectionId,
          admissionNumber: admNo, firstName: row.firstName, lastName: row.lastName,
          dob: row.dob ? new Date(row.dob) : undefined, gender: row.gender as any,
          email: row.email, phone: row.phone, status: 'active', createdBy: actorId,
        });

        if (row.guardianName) {
          // Auto-create parent stub
        }
        successful++;
      } catch (err: any) {
        errors.push({ row: i + 1, message: err.message || 'Failed' });
        failed++;
      }
    }

    await this.audit(tenantId, actorId, 'student', null, 'bulk_import', { total: input.students.length, successful, failed });
    return { total: input.students.length, successful, failed, errors };
  }

  // ─── EXPORT ───
  async exportStudents(tenantId: string, branchId: string, classId?: string) {
    return studentRepository.exportStudents(tenantId, branchId, classId);
  }

  // ─── STATS ───
  async getStats(tenantId: string, branchId: string) {
    const byClass = await studentRepository.countByClass(tenantId, branchId);
    const total = byClass.reduce((sum, c) => sum + c._count.id, 0);
    return { total, byClass };
  }

  // ─── PRIVATE ───
  private async audit(tenantId: string, actorId: string, entityType: string, entityId: string | null, action: string, metadata?: Record<string, unknown>) {
    await prisma.auditLog.create({ data: { tenantId, actorUserId: actorId, entityType, entityId, action, metadata: (metadata as any) || undefined } });
  }
}

export const studentService = new StudentService();
