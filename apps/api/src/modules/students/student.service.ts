import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '../../utils/errors.js';
import { logger } from '../../config/index.js';
import { prisma } from '@erp/database';
import { studentRepository } from './student.repository.js';
import { buildPaginationMeta } from '@erp/utils';
import { NotificationTriggers } from '../notifications/index.js';
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

  // ─── GET CURRENT STUDENT (for student portal) ───
  async getMe(tenantId: string, userId: string) {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        tenantId: true,
        admissionNumber: true,
        rollNumber: true,
        firstName: true,
        lastName: true,
        classId: true,
        sectionId: true,
        batchId: true,
        branchId: true,
        academicSessionId: true,
        status: true,
        class: { select: { id: true, name: true, code: true } },
        section: { select: { id: true, name: true } },
      },
    });

    if (!student || student.tenantId !== tenantId) {
      throw new AppError(404, 'NOT_FOUND', 'No student profile linked to this account');
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

    // Core admission in a transaction: Student + User Account + Role + Parent
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create student
      const student = await tx.student.create({
        data: {
          tenantId,
          branchId,
          academicSessionId: input.academicSessionId,
          classId: input.classId || undefined,
          sectionId: input.sectionId || undefined,
          batchId: input.batchId || undefined,
          admissionNumber,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName || undefined,
          dob: input.dob ? new Date(input.dob) : undefined,
          gender: input.gender as any || undefined,
          email: input.email || undefined,
          phone: input.phone || undefined,
          bloodGroup: input.bloodGroup || undefined,
          address: input.address || undefined,
          city: input.city || undefined,
          state: input.state || undefined,
          pincode: input.pincode || undefined,
          admissionDate: input.admissionDate ? new Date(input.admissionDate) : new Date(),
          status: 'active',
          createdBy: actorId,
        },
      });

      // 2. Create user account for student login
      // Login ID: FULLNAME + ADMISSIONNUMBER (uppercase, no spaces/special chars)
      // Password: FIRST4LETTERS + RANDOM4DIGITS
      let credentials: { username: string; password: string } | undefined;
      const cleanName = input.firstName.replace(/[^a-zA-Z]/g, '').toUpperCase();
      const admNumeric = admissionNumber.replace(/[^0-9]/g, '');
      const username = `${cleanName}${admNumeric}`;
      const first4 = cleanName.slice(0, 4).padEnd(4, 'X'); // Pad if name < 4 chars
      const random4 = String(Math.floor(1000 + Math.random() * 9000)); // 4-digit random
      const password = `${first4}${random4}`;
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await tx.user.create({
        data: {
          tenantId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email || `${username}@student.schoolnex.in`,
          username,
          passwordHash,
          phone: input.phone || undefined,
          status: 'active',
          emailVerified: true, // Admin-created accounts don't need verification
        },
      });

      // 3. Assign student role
      const studentRole = await tx.role.findUnique({ where: { tenantId_code: { tenantId, code: 'student' } } });
      if (studentRole) {
        await tx.userRole.create({ data: { userId: user.id, roleId: studentRole.id, tenantId } });
      }

      // 4. Link user → student
      await tx.student.update({ where: { id: student.id }, data: { userId: user.id } });

      // 5. Create guardian if provided
      let parentId: string | undefined;
      if (input.guardian && input.guardian.firstName && input.guardian.lastName) {
        const parent = await tx.parent.create({
          data: {
            tenantId,
            firstName: input.guardian.firstName,
            lastName: input.guardian.lastName,
            relation: input.guardian.relation || undefined,
            phone: input.guardian.phone || undefined,
            email: input.guardian.email || undefined,
            occupation: input.guardian.occupation || undefined,
            address: input.guardian.address || undefined,
          },
        });
        await tx.parentStudent.create({
          data: { parentId: parent.id, studentId: student.id, relation: input.guardian.relation || 'guardian', isPrimary: true },
        });
        parentId = parent.id;
      }

      credentials = { username, password };
      return { student, credentials, parentId };
    }, { timeout: 15000 });

    await this.audit(tenantId, actorId, 'student', result.student.id, 'admit');
    logger.info({ tenantId, studentId: result.student.id, admissionNumber, actorId }, 'Student admitted');

    // Trigger admission notification (non-fatal, outside transaction)
    try {
      if (input.guardian) {
        await NotificationTriggers.admissionConfirmation(tenantId, {
          applicantName: `${input.firstName} ${input.lastName}`,
          email: input.guardian.email,
          phone: input.guardian.phone,
          classApplied: input.classId,
        });
      }
    } catch (notifyErr) {
      logger.warn({ err: notifyErr }, 'Admission notification failed (non-fatal)');
    }

    return { ...result.student, credentials: result.credentials };
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

    // Auto-create user account for parent login
    try {
      if (input.email) {
        const username = `parent-${parent.id.substring(0, 8)}`;
        const password = crypto.randomBytes(4).toString('hex');
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: {
            tenantId, firstName: input.firstName, lastName: input.lastName,
            email: input.email, username, passwordHash, phone: input.phone,
            status: 'active', emailVerified: false,
          },
        });
        const parentRole = await prisma.role.findUnique({ where: { tenantId_code: { tenantId, code: 'parent' } } });
        if (parentRole) {
          await prisma.userRole.create({ data: { userId: user.id, roleId: parentRole.id, tenantId } });
        }
        await prisma.parent.update({ where: { id: parent.id }, data: { userId: user.id } });
      }
    } catch (accountErr) {
      logger.warn({ err: accountErr, parentId: parent.id }, 'Failed to create parent user account (non-fatal)');
    }

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

  // ─── PARENTS LIST ───
  async listParents(tenantId: string, params: { page?: number; limit?: number; search?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const where: any = { tenantId, deletedAt: null };
    if (params.search) {
      where.OR = [
        { firstName: { contains: params.search, mode: 'insensitive' } },
        { lastName: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.parent.findMany({
        where,
        include: { studentLinks: { include: { student: { select: { firstName: true, lastName: true } } } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.parent.count({ where }),
    ]);
    const meta = buildPaginationMeta(total, page, limit);
    return { data, meta };
  }

  // ─── ADMISSIONS ───
  async listAdmissions(tenantId: string, branchId: string, params: { page?: number; limit?: number; search?: string; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const where: any = { tenantId, branchId };
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { applicantName: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    const [data, total] = await Promise.all([
      prisma.admission.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.admission.count({ where }),
    ]);
    const meta = buildPaginationMeta(total, page, limit);
    return { data, meta };
  }

  async createAdmission(tenantId: string, branchId: string, input: { applicantName: string; email?: string; phone?: string; guardianName?: string; guardianPhone?: string; classApplied?: string; source?: string }, actorId: string) {
    const admission = await prisma.admission.create({
      data: { tenantId, branchId, ...input, status: 'inquiry' },
    });
    await this.audit(tenantId, actorId, 'admission', admission.id, 'create');
    return admission;
  }

  async updateAdmissionStatus(tenantId: string, id: string, status: string, actorId: string) {
    const admission = await prisma.admission.findUnique({ where: { id } });
    if (!admission || admission.tenantId !== tenantId) throw new AppError(404, 'NOT_FOUND', 'Admission not found');
    const updated = await prisma.admission.update({ where: { id }, data: { status: status as any } });
    await this.audit(tenantId, actorId, 'admission', id, 'update_status', { newStatus: status });
    return updated;
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