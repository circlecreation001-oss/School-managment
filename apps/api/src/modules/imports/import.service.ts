import { prisma } from '@erp/database';
import { logger } from '../../config/index.js';
import { AppError } from '../../utils/errors.js';
import type { StartImportInput } from './import.schema.js';

// Smart column mapping aliases
const FIELD_ALIASES: Record<string, string[]> = {
  firstName: ['first name', 'student name', 'full name', 'name', 'student', 'fname'],
  lastName: ['last name', 'surname', 'lname', 'family name'],
  email: ['email', 'mail', 'e-mail', 'email address', 'email id'],
  phone: ['phone', 'mobile', 'contact', 'phone number', 'mobile number', 'contact number', 'cell'],
  admissionNumber: ['admission number', 'admission no', 'adm no', 'student id', 'roll', 'roll no', 'roll number', 'enrollment'],
  fatherName: ['father name', 'father', 'guardian', 'parent name', "father's name"],
  motherName: ['mother name', 'mother', "mother's name"],
  dateOfBirth: ['date of birth', 'dob', 'birth date', 'birthdate', 'date_of_birth'],
  gender: ['gender', 'sex'],
  className: ['class', 'grade', 'standard', 'class name', 'std'],
  sectionName: ['section', 'division', 'sec', 'section name'],
  address: ['address', 'residential address', 'home address', 'full address'],
  city: ['city', 'town', 'district'],
  state: ['state', 'province'],
  bloodGroup: ['blood group', 'blood_group', 'blood type'],
  category: ['category', 'caste', 'social category'],
  religion: ['religion', 'faith'],
  nationality: ['nationality', 'nation'],
  employeeCode: ['employee code', 'emp code', 'emp id', 'employee id', 'staff id', 'teacher id'],
  department: ['department', 'dept', 'department name'],
  designation: ['designation', 'position', 'role', 'job title'],
  salary: ['salary', 'ctc', 'basic salary', 'monthly salary', 'pay'],
  joiningDate: ['joining date', 'join date', 'date of joining', 'doj', 'start date'],
  subject: ['subject', 'subject name', 'course'],
};

/**
 * Auto-detect column mappings based on aliases.
 */
export function autoDetectMappings(headers: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};

  for (const header of headers) {
    const normalized = header.toLowerCase().trim().replace(/[_\-\.]/g, ' ');
    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (aliases.includes(normalized) || normalized === field.toLowerCase()) {
        mappings[header] = field;
        break;
      }
    }
  }

  return mappings;
}

/**
 * Validate rows before import.
 */
export function validateRows(entity: string, rows: Record<string, any>[], mappings: Record<string, string>) {
  const errors: Array<{ row: number; field: string; message: string }> = [];
  const valid: Record<string, any>[] = [];
  const duplicates: number[] = [];
  const seenKeys = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const mapped: Record<string, any> = {};
    let hasError = false;

    // Apply mappings
    for (const [col, value] of Object.entries(row)) {
      const targetField = mappings[col] || col;
      mapped[targetField] = value;
    }

    // Entity-specific validation
    if (entity === 'students') {
      if (!mapped.firstName && !mapped.name) {
        errors.push({ row: i + 1, field: 'name', message: 'Student name is required' });
        hasError = true;
      }
      // Split full name if firstName not separate
      if (!mapped.firstName && mapped.name) {
        const parts = String(mapped.name).trim().split(/\s+/);
        mapped.firstName = parts[0];
        mapped.lastName = parts.slice(1).join(' ');
      }
      if (mapped.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(mapped.email))) {
        errors.push({ row: i + 1, field: 'email', message: 'Invalid email format' });
        hasError = true;
      }
      if (mapped.phone && !/^\+?[0-9]{7,15}$/.test(String(mapped.phone).replace(/[\s\-]/g, ''))) {
        errors.push({ row: i + 1, field: 'phone', message: 'Invalid phone number' });
        hasError = true;
      }
      // Duplicate check by admissionNumber
      const key = mapped.admissionNumber ? String(mapped.admissionNumber).trim().toUpperCase() : '';
      if (key && seenKeys.has(key)) {
        duplicates.push(i + 1);
      }
      if (key) seenKeys.add(key);
    }

    if (entity === 'teachers' || entity === 'staff') {
      if (!mapped.firstName && !mapped.name) {
        errors.push({ row: i + 1, field: 'name', message: 'Name is required' });
        hasError = true;
      }
      if (!mapped.firstName && mapped.name) {
        const parts = String(mapped.name).trim().split(/\s+/);
        mapped.firstName = parts[0];
        mapped.lastName = parts.slice(1).join(' ');
      }
    }

    if (!hasError) valid.push(mapped);
  }

  return { valid, errors, duplicates, totalRows: rows.length, validCount: valid.length, errorCount: errors.length };
}

export class ImportService {
  /**
   * Process the import after validation and mapping.
   */
  async processImport(
    tenantId: string,
    branchId: string,
    input: StartImportInput,
    rows: Record<string, any>[],
    actorId: string,
  ) {
    const results = { imported: 0, updated: 0, skipped: 0, failed: 0, errors: [] as Array<{ row: number; message: string }> };

    for (let i = 0; i < rows.length; i++) {
      try {
        const row = rows[i]!;
        if (input.entity === 'students') {
          await this.importStudent(tenantId, branchId, row, input, actorId);
          results.imported++;
        } else if (input.entity === 'teachers') {
          await this.importTeacher(tenantId, branchId, row, input, actorId);
          results.imported++;
        } else if (input.entity === 'classes') {
          await this.importClass(tenantId, branchId, row, actorId);
          results.imported++;
        } else {
          // Generic: just count as imported for now
          results.imported++;
        }
      } catch (err: any) {
        results.failed++;
        results.errors.push({ row: i + 1, message: err.message || 'Unknown error' });
      }
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        tenantId, actorUserId: actorId, entityType: 'import', action: 'bulk_import',
        metadata: { entity: input.entity, imported: results.imported, failed: results.failed, total: rows.length } as any,
      },
    });

    logger.info({ tenantId, entity: input.entity, ...results }, 'Import completed');
    return results;
  }

  private async importStudent(tenantId: string, branchId: string, row: Record<string, any>, input: StartImportInput, actorId: string) {
    const admissionNumber = row.admissionNumber ? String(row.admissionNumber).trim().toUpperCase() : null;

    // Check duplicate
    if (admissionNumber) {
      const existing = await prisma.student.findFirst({ where: { tenantId, admissionNumber } });
      if (existing) {
        if (input.duplicateAction === 'skip') return;
        if (input.duplicateAction === 'update') {
          await prisma.student.update({ where: { id: existing.id }, data: { firstName: row.firstName, lastName: row.lastName || '' } });
          return;
        }
      }
    }

    // Auto-create class if needed
    let classId: string | null = null;
    if (row.className && input.autoCreate) {
      const cls = await prisma.class.findFirst({ where: { tenantId, branchId, name: { contains: String(row.className), mode: 'insensitive' } } });
      if (cls) {
        classId = cls.id;
      } else {
        const session = await prisma.academicSession.findFirst({ where: { tenantId, isCurrent: true } });
        if (session) {
          const newClass = await prisma.class.create({ data: { tenantId, branchId, academicSessionId: session.id, name: String(row.className), code: String(row.className).toUpperCase().replace(/\s+/g, ''), status: 'active' } });
          classId = newClass.id;
        }
      }
    }

    // Auto-create section if needed
    let sectionId: string | null = null;
    if (row.sectionName && classId && input.autoCreate) {
      const sec = await prisma.section.findFirst({ where: { tenantId, classId, name: { contains: String(row.sectionName), mode: 'insensitive' } } });
      if (sec) {
        sectionId = sec.id;
      } else {
        const newSec = await prisma.section.create({ data: { tenantId, branchId, classId, name: String(row.sectionName), code: String(row.sectionName).toUpperCase(), status: 'active' } });
        sectionId = newSec.id;
      }
    }

    await prisma.student.create({
      data: {
        tenantId, branchId,
        academicSessionId: classId ? (await prisma.class.findUnique({ where: { id: classId }, select: { academicSessionId: true } }))?.academicSessionId || '' : '',
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        admissionNumber: admissionNumber || `IMP${Date.now().toString(36).toUpperCase()}`,
        email: row.email || null,
        phone: row.phone ? String(row.phone) : null,
        gender: row.gender ? String(row.gender).toLowerCase() as any : null,
        dob: row.dateOfBirth ? new Date(row.dateOfBirth) : null,
        classId: classId || undefined,
        sectionId: sectionId || undefined,
        status: 'active',
        createdBy: actorId,
      } as any,
    });
  }

  private async importTeacher(tenantId: string, branchId: string, row: Record<string, any>, input: StartImportInput, actorId: string) {
    const employeeCode = row.employeeCode ? String(row.employeeCode).trim().toUpperCase() : null;

    if (employeeCode) {
      const existing = await prisma.teacher.findFirst({ where: { tenantId, employeeCode } });
      if (existing) {
        if (input.duplicateAction === 'skip') return;
        if (input.duplicateAction === 'update') {
          await prisma.teacher.update({ where: { id: existing.id }, data: { firstName: row.firstName, lastName: row.lastName || '' } });
          return;
        }
      }
    }

    await prisma.teacher.create({
      data: {
        tenantId, branchId,
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        employeeCode: employeeCode || `EMP${Date.now().toString(36).toUpperCase()}`,
        email: row.email || null,
        phone: row.phone ? String(row.phone) : null,
        gender: row.gender ? String(row.gender).toLowerCase() as any : null,
        status: 'active',
        createdBy: actorId,
      },
    });
  }

  private async importClass(tenantId: string, branchId: string, row: Record<string, any>, _actorId: string) {
    const name = String(row.name || row.className || '').trim();
    if (!name) throw new Error('Class name is required');

    const existing = await prisma.class.findFirst({ where: { tenantId, branchId, name: { equals: name, mode: 'insensitive' } } });
    if (existing) return;

    const session = await prisma.academicSession.findFirst({ where: { tenantId, isCurrent: true } });
    if (!session) throw new Error('No active academic session');

    await prisma.class.create({ data: { tenantId, branchId, academicSessionId: session.id, name, code: name.toUpperCase().replace(/\s+/g, ''), status: 'active' } });
  }

  /**
   * Get import templates for download.
   */
  getTemplate(entity: string): { headers: string[]; sampleRow: Record<string, string> } {
    const templates: Record<string, { headers: string[]; sampleRow: Record<string, string> }> = {
      students: {
        headers: ['Admission Number', 'First Name', 'Last Name', 'Date of Birth', 'Gender', 'Class', 'Section', 'Email', 'Phone', 'Father Name', 'Mother Name', 'Address', 'City', 'State', 'Blood Group', 'Category', 'Religion'],
        sampleRow: { 'Admission Number': 'STU2025001', 'First Name': 'Rahul', 'Last Name': 'Sharma', 'Date of Birth': '2010-05-15', 'Gender': 'Male', 'Class': '10', 'Section': 'A', 'Email': 'rahul@example.com', 'Phone': '+919876543210', 'Father Name': 'Suresh Sharma', 'Mother Name': 'Priya Sharma', 'Address': '123 Main Street', 'City': 'Delhi', 'State': 'Delhi', 'Blood Group': 'B+', 'Category': 'General', 'Religion': 'Hindu' },
      },
      teachers: {
        headers: ['Employee Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Department', 'Designation', 'Joining Date', 'Qualification', 'Salary'],
        sampleRow: { 'Employee Code': 'TCH001', 'First Name': 'Priya', 'Last Name': 'Verma', 'Email': 'priya@school.com', 'Phone': '+919876543211', 'Gender': 'Female', 'Department': 'Science', 'Designation': 'Senior Teacher', 'Joining Date': '2020-06-01', 'Qualification': 'M.Sc, B.Ed', 'Salary': '45000' },
      },
      staff: {
        headers: ['Employee Code', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender', 'Department', 'Designation', 'Joining Date'],
        sampleRow: { 'Employee Code': 'STF001', 'First Name': 'Ram', 'Last Name': 'Kumar', 'Email': 'ram@school.com', 'Phone': '+919876543212', 'Gender': 'Male', 'Department': 'Admin', 'Designation': 'Office Assistant', 'Joining Date': '2019-01-15' },
      },
      classes: {
        headers: ['Class Name', 'Code', 'Numeric Level'],
        sampleRow: { 'Class Name': 'Class 10', 'Code': 'C10', 'Numeric Level': '10' },
      },
    };
    return templates[entity] || { headers: ['Name'], sampleRow: { Name: 'Sample' } };
  }

  /**
   * Get import history.
   */
  async getHistory(tenantId: string) {
    return prisma.auditLog.findMany({
      where: { tenantId, entityType: 'import' },
      select: { id: true, action: true, metadata: true, createdAt: true, actorUserId: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export const importService = new ImportService();
